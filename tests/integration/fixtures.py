from gltest import get_contract_factory


def deploy_registry():
    factory = get_contract_factory("ModerationRegistry")
    return factory.deploy(args=[])
