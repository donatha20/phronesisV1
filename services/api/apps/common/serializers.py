from __future__ import annotations

import json


class JSONStringFieldsMixin:
    """Multipart requests (the local-dev fallback for file uploads, since
    there's no S3 bucket to presign against) can only send strings — but a
    ``JSONField`` normally expects an already-parsed list/dict and stores a
    JSON-encoded string verbatim otherwise. This decodes the named fields
    when they arrive as strings, so JSON body and multipart body behave the
    same way.
    """

    json_string_fields: tuple[str, ...] = ()

    def to_internal_value(self, data):  # type: ignore[no-untyped-def]
        if self.json_string_fields and hasattr(data, "keys"):
            mutable = {k: data[k] for k in data.keys()} if hasattr(data, "getlist") else dict(data)
            for field in self.json_string_fields:
                value = mutable.get(field)
                if isinstance(value, str):
                    try:
                        mutable[field] = json.loads(value)
                    except ValueError:
                        pass
            data = mutable
        return super().to_internal_value(data)  # type: ignore[misc]
