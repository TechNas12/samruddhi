from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Address, User
from schemas import AddressCreate, AddressUpdate, AddressOut
from auth import require_auth

router = APIRouter(prefix="/api/addresses", tags=["Addresses"])


@router.get("", response_model=List[AddressOut])
def list_addresses(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    return db.query(Address).filter(Address.user_id == user.id).all()


@router.post("", response_model=AddressOut)
def create_address(data: AddressCreate, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    if data.is_default:
        db.query(Address).filter(Address.user_id == user.id).update({"is_default": False})

    addr = Address(user_id=user.id, **data.model_dump())
    db.add(addr)
    db.commit()
    db.refresh(addr)
    return addr


@router.put("/{address_id}", response_model=AddressOut)
def update_address(address_id: int, data: AddressUpdate, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    addr = db.query(Address).filter(Address.id == address_id, Address.user_id == user.id).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")

    if data.is_default:
        db.query(Address).filter(Address.user_id == user.id).update({"is_default": False})

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(addr, key, value)
    db.commit()
    db.refresh(addr)
    return addr


@router.delete("/{address_id}")
def delete_address(address_id: int, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    addr = db.query(Address).filter(Address.id == address_id, Address.user_id == user.id).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    db.delete(addr)
    db.commit()
    return {"detail": "Address deleted"}
