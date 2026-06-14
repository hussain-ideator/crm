from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.companies.models import Company


@receiver(post_save, sender=Company)
def nullify_company_fk_on_soft_delete(sender, instance, **kwargs):
    if instance.is_deleted:
        from apps.contacts.models import Contact

        Contact.objects.filter(company_fk=instance).update(company_fk=None)
