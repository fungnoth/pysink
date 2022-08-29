from typing import List
from pytube import Search
from datetime import datetime, timedelta
import uuid


class SessionItem:
    def __init__(self) -> None:
        self.id : str = str(uuid.uuid4())
        self.last_use : datetime = datetime.now()

class SessionManager:
    TIMEOUT : timedelta
    def __init__(self, timeout : timedelta = timedelta(hours=1)) -> None:
        self.TIMEOUT = timeout
        self.items : List[SessionItem] = []
    
    def add(self, item : SessionItem):
        self.items.append(item)
        self.cleanup()    

    def renew(self, item : SessionItem):
        self.items.remove(item)
        self.items.append(item)
        item.last_use = datetime.now()

    def get(self, id):
        for x in self.items:
            if x.id == id:
                return x

    def cleanup(self):
        while (datetime.now() - self.items[0].last_use) > self.TIMEOUT:
            self.items.pop(0)

    
class SearchSession(SessionItem):
    def __init__(self, query) -> None:
        super().__init__()
        self.search:Search = Search(query)