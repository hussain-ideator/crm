from rest_framework.routers import DefaultRouter

from .views import LeadSourceViewSet, LeadViewSet

router = DefaultRouter()
router.register(r"leads", LeadViewSet, basename="lead")
router.register(r"lead-sources", LeadSourceViewSet, basename="leadsource")

urlpatterns = router.urls
