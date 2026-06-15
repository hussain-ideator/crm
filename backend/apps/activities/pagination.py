from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination


class ActivityPageNumberPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = "page_size"
    max_page_size = 100
    page_query_param = "page"

    def get_page_size(self, request):
        page_size = super().get_page_size(request)
        raw = request.query_params.get(self.page_size_query_param)
        if raw is not None:
            try:
                requested = int(raw)
            except (ValueError, TypeError) as exc:
                raise ValidationError({"page_size": "A valid integer is required."}) from exc
            if requested > self.max_page_size:
                msg = f"Ensure this value is less than or equal to {self.max_page_size}."
                raise ValidationError({"page_size": msg})
        return page_size
