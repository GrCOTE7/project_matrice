from fastapi import APIRouter, Depends, Request

from ...core.limiter import limiter
from ...core.security import require_roles
from ...schemas.hello import AdminHelloResponse, HelloResponse
from ...services.hello_service import (
    build_admin_hello_response,
    build_hello_response,
)
from ...config import settings

router = APIRouter()


@router.get("/api/hello", response_model=HelloResponse)
@limiter.limit(settings.RATE_LIMIT_HELLO)
def hello(request: Request):
    user = getattr(request.state, "user", {})
    return build_hello_response(user)


@router.get("/api/admin/hello", response_model=AdminHelloResponse)
@limiter.limit(settings.RATE_LIMIT_HELLO)
def admin_hello(
    request: Request,
    _rbac: None = Depends(require_roles("admin")),
):
    user = getattr(request.state, "user", {})
    return build_admin_hello_response(user)
