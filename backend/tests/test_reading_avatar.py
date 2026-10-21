from __future__ import annotations

import io

import pytest
from fastapi import HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.datastructures import Headers

from app.domains.reading import service_reading as service
from app.domains.reading.model_reading import ReadingUser

JPEG_BYTES = b"\xff\xd8\xff\xe0" + b"0" * 2048


def upload(data: bytes, content_type: str) -> UploadFile:
    return UploadFile(file=io.BytesIO(data), filename="photo", headers=Headers({"content-type": content_type}))


@pytest.mark.asyncio
async def test_profile_photo_upload_read_and_remove(db: AsyncSession, voters: tuple[ReadingUser, ReadingUser]) -> None:
    admin, student = voters
    student_id, teammate_id = str(student.id), str(admin.id)
    # Counted as active today, so the daily streak update (which reloads the user) stays out of this test.
    student.last_active_date = service._today()
    await db.commit()

    me = await service.get_current_reading_user(student_id, db)
    assert me.avatar_version is None

    me = await service.upload_my_avatar(student_id, upload(JPEG_BYTES, "image/jpeg"), db)
    assert me.avatar_version is not None
    image, mime = await service.get_user_avatar_image(student_id, db)
    assert (image, mime) == (JPEG_BYTES, "image/jpeg")

    team = await service.get_my_team(teammate_id, db)
    assert next(m for m in team.members if str(m.id) == student_id).avatar_version == me.avatar_version

    me = await service.remove_my_avatar(student_id, db)
    assert me.avatar_version is None
    with pytest.raises(HTTPException) as missing:
        await service.get_user_avatar_image(student_id, db)
    assert missing.value.status_code == 404


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("data", "content_type", "status_code"),
    [(b"%PDF-1.7", "application/pdf", 422), (b"0" * (service.AVATAR_MAX_BYTES + 1), "image/jpeg", 413)],
)
async def test_profile_photo_rejects_wrong_files(
    db: AsyncSession, voters: tuple[ReadingUser, ReadingUser], data: bytes, content_type: str, status_code: int
) -> None:
    _, student = voters
    with pytest.raises(HTTPException) as rejected:
        await service.upload_my_avatar(str(student.id), upload(data, content_type), db)
    assert rejected.value.status_code == status_code
