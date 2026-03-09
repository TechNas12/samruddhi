from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth import require_auth, require_admin

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/{key}", response_model=schemas.SystemSettingOut)
def get_setting(key: str, db: Session = Depends(get_db)):
    setting = db.query(models.SystemSetting).filter(models.SystemSetting.key == key).first()
    if not setting:
        # Default value for carousel timer if not set
        if key == "product_carousel_timer":
            return {"key": key, "value": "5", "description": "Default timer"}
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting

@router.put("/{key}", response_model=schemas.SystemSettingOut)
def update_setting(key: str, setting_data: schemas.SystemSettingBase, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    setting = db.query(models.SystemSetting).filter(models.SystemSetting.key == key).first()
    if not setting:
        setting = models.SystemSetting(key=key, value=setting_data.value, description=setting_data.description)
        db.add(setting)
    else:
        setting.value = setting_data.value
        if setting_data.description:
            setting.description = setting_data.description
            
    db.commit()
    db.refresh(setting)
    return setting
