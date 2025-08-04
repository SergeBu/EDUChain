FROM azul/zulu-openjdk-alpine:17
WORKDIR /app

WORKDIR /app
COPY ./educhain-api-tests2/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]