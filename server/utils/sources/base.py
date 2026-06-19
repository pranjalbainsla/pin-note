from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class SourceMetadata:
    thumbnail_url: str | None = None
    author: str | None = None
    title: str | None = None
    description: str | None = None


class SourceHandler(ABC):
    source_type: str

    @abstractmethod
    def can_handle(self, url: str) -> bool:
        pass

    @abstractmethod
    def fetch_metadata(self, url: str) -> SourceMetadata:
        pass

    @abstractmethod
    def fetch_content(self, url: str) -> str:
        pass
