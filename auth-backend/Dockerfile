# Use a lightweight OpenJDK 21 image
FROM eclipse-temurin:21-jdk-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the built JAR file from your Spring Boot project
# IMPORTANT: You need to build your Spring Boot application first (e.g., with 'mvn clean package')
# and ensure the JAR file exists in the 'target/' directory before building the Docker image.
# Replace 'auth-backend-0.0.1-SNAPSHOT.jar' with your actual JAR file name.
COPY target/auth-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose the port your Spring Boot application runs on
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
