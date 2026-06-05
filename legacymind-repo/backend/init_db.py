from app.services.database import engine, Base

# We must import the models directly so SQLAlchemy knows what tables to build
from app.models.user import User
# If you have already created these models, uncomment them:
# from app.models.incident import Incident
# from app.models.document import Document

print("Building database tables...")
Base.metadata.create_all(bind=engine)
print("Success! Tables created.")