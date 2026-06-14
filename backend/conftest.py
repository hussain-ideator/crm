"""
Pytest configuration for the CRM backend.

The 'crm' MySQL user does not have CREATE DATABASE privileges, so we
configure pytest-django to reuse the existing 'crm' database for tests
rather than creating 'test_crm'. Each test still runs inside a transaction
that is rolled back on teardown, so no data persists between tests.

To run tests against a dedicated 'test_crm' database (recommended in CI),
grant the DB user CREATE DATABASE privileges and remove the override below.
"""
import pytest


@pytest.fixture(scope="session")
def django_db_setup(django_test_environment, django_db_blocker):
    """Override DB setup to reuse the existing 'crm' database in-place."""
    from django.test.utils import setup_databases

    with django_db_blocker.unblock():
        setup_databases(verbosity=0, interactive=False, keepdb=True)
