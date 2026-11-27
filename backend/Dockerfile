# Stage 1: Build file JAR bang Maven Wrapper + JDK 25
FROM eclipse-temurin:25-jdk AS builder
WORKDIR /app

# Copy file cau hinh Maven truoc de tan dung Docker layer cache khi code thay doi
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy ma nguon va dong goi file .jar (bo qua test vi test can ket noi DB)
COPY src src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Runtime nhe chi chua JRE 25 + file JAR
FROM eclipse-temurin:25-jre
WORKDIR /app

# Chay duoi quyen user thuong de tang bao mat container
RUN groupadd --system app && useradd --system --gid app app
COPY --from=builder /app/target/*.jar app.jar
RUN chown app:app app.jar
USER app

EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
