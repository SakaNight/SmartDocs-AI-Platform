from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password

# 注册新用户
def create_user(db: Session, username: str, email: str, password: str, role: str = "user"):
    user = User(username=username, email=email, password_hash=hash_password(password), role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# 查找用户
def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

# 验证用户密码
def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user 