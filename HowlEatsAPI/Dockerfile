# --- Stage 1: Build the application ---
# Use a Maven image with a specific Java version to build our application
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

COPY mvnw mvnw
COPY mvnw.cmd mvnw.cmd
COPY .mvn .mvn
COPY pom.xml pom.xml

RUN ./mvnw -B dependency:go-offline

COPY src src

RUN ./mvnw -B package -DskipTests

# --- Stage 2: Create the final, smaller image ---
# Use a minimal Java Runtime Environment (JRE) image
FROM eclipse-temurin:21-jre
WORKDIR /app

ARG JAR_FILE=target/HowlEatsAPI-0.0.1-SNAPSHOT.jar
COPY --from=build /app/${JAR_FILE} app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
