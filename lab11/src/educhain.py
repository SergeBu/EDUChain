class EduChain:
    def __init__(self):
        self.blocks = []
    
    def add_block(self, data):
        self.blocks.append(data)
        return True