import pytest
from gltest.helpers import load_fixture
from gltest.assertions import tx_execution_succeeded

from tests.integration.fixtures import deploy_registry


@pytest.mark.integration
def test_submit_content_end_to_end():
    contract = load_fixture(deploy_registry)

    receipt = contract.submit_content(
        args=["Thanks for the quick response, this fixed my issue perfectly."]
    ).transact(wait_interval=10000, wait_retries=24)

    assert tx_execution_succeeded(receipt)
    assert contract.total_cases(args=[]).call() == 1

    case = contract.get_case(args=[0]).call()
    assert case["decision"] in ("ALLOW", "FLAG", "BLOCK")
    assert case["primary_category"] in (
        "spam",
        "hate_speech",
        "harassment",
        "nsfw",
        "violence",
        "none",
    )
