from django.contrib import admin

from .models import Contact


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "email", "company_fk", "owner_fk", "is_deleted", "created_at")
    list_filter = ("is_deleted",)
    search_fields = ("first_name", "last_name", "email", "phone")
