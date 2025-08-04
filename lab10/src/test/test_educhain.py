import pytest
#from educhain import EduChain  # Импорт тестируемого модуля
from ..educhain import EduChain

class TestEduChain:
    def test_creation(self):
        """Тест создания экземпляра"""
        chain = EduChain()
        assert chain is not None
        assert hasattr(chain, 'blocks')
        assert isinstance(chain.blocks, list)
        assert len(chain.blocks) == 0

    def test_add_block(self):
        """Тест добавления блока"""
        chain = EduChain()
        initial_length = len(chain.blocks)
        result = chain.add_block("Test Data")
        
        assert result == True
        assert len(chain.blocks) == initial_length + 1
        assert chain.blocks[-1] == "Test Data"