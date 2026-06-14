from django.contrib import admin

from .models import Lead, LeadSource


@admin.register(LeadSource)
class LeadSourceAdmin(admin.ModelAdmin):
    list_display = ["id", "name"]
    search_fields = ["name"]


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "first_name",
        "last_name",
        "email",
        "company_name",
        "status",
        "owner_fk",
        "created_at",
        "is_deleted",
    ]
    search_fields = [
        "first_name",
        "last_name",
        "email",
        "company_name",
        "phone",
    ]
    list_filter = ["status", "is_deleted"]
