package com.arcdeploy.arcDeployBackend.service;

import com.arcdeploy.arcDeployBackend.awscdktf.MyAwsStack;
import com.arcdeploy.arcDeployBackend.dto.ArcDto;
import com.arcdeploy.arcDeployBackend.model.*;
import com.hashicorp.cdktf.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ArcServiceImpl implements ArcService {
    List<ArcDto> arcDtosList = new ArrayList<>();
    @Override
    public ArcDto saveArc(ArcDto arcDto) throws IOException, InterruptedException{

        arcDtosList.add(arcDto);
        String bucketName = "arc-deploy-terraform-state";
        String workingDir = "/opt/app";

        String arcName = arcDto.getArc().replaceAll("\\s", "").toLowerCase();
        List<AwsCloud> awsCloud = arcDto.getAws();

        App app = new App();
        MyAwsStack awsStack = new MyAwsStack(app, awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId(), arcDto);
        awsStack.toTerraform();
        app.synth();

        String dockerfileContent = "FROM shubhamb756/ubuntu-terraform:3.0\n" +
                "WORKDIR " + workingDir + "\n" +
                "COPY cdktf.out/stacks/" + awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId() + "/cdk.tf.json " + workingDir + "/.\n" +
                "RUN terraform init\n" +
                "RUN terraform apply --auto-approve\n" +
                "RUN aws s3 cp terraform." + awsCloud.get(0).getProjectName() + arcName + awsCloud.get(0).getAcId() + ".tfstate s3://" + bucketName + "/" + awsCloud.get(0).getProjectName() + arcName + awsCloud.get(0).getAcId() + "/\n" +
                "RUN aws s3 cp cdk.tf.json s3://" + bucketName + "/" + awsCloud.get(0).getProjectName() + arcName + awsCloud.get(0).getAcId() + "/";

        // Specify the path where the Dockerfile will be created
        Path dockerfilePath = Path.of(workingDir + "/Dockerfile-" + awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId());
        Files.createDirectories(dockerfilePath.getParent());

        ProcessBuilder pruneProcessBuilder = new ProcessBuilder("docker", "builder", "prune", "--all", "--force");
        pruneProcessBuilder.directory(dockerfilePath.getParent().toFile());
        Process pruneProcess = pruneProcessBuilder.start();
        int exitCode1 = pruneProcess.waitFor();
        System.out.println("Docker prune builder exited with code: " + exitCode1 + "\n");

        // Write the content to the Dockerfile
        Files.writeString(dockerfilePath, dockerfileContent, StandardOpenOption.CREATE);
        // Build the Docker image
        ProcessBuilder imageBuildBuilder = new ProcessBuilder("docker", "build", "-t", awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId(), "-f", dockerfilePath.toString(), workingDir + "/.");
        imageBuildBuilder.directory(dockerfilePath.getParent().toFile());
        Process imageBuildProcess = imageBuildBuilder.start();
        int exitCode2 = imageBuildProcess.waitFor();
        System.out.println("Docker build process exited with code: " + exitCode2);

        Files.deleteIfExists(dockerfilePath);

        ProcessBuilder imageRemoveProcessBuilder = new ProcessBuilder("docker", "rmi", "-f", awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId());
        imageRemoveProcessBuilder.directory(dockerfilePath.getParent().toFile());
        Process imageRemoveProcess = imageRemoveProcessBuilder.start();
        int exitCode3 = imageRemoveProcess.waitFor();
        System.out.println("Docker image removal exited with code: " + exitCode3);

        ProcessBuilder noneImageProcessBuilder = new ProcessBuilder("docker", "images", "-q", "--filter", "\"dangling=true\"", "|", "xargs", "docker", "rmi");
        noneImageProcessBuilder.directory(dockerfilePath.getParent().toFile());
        Process noneImageRemoveProcess = noneImageProcessBuilder.start();
        int exitCode4 = noneImageRemoveProcess.waitFor();
        System.out.println("Docker none image removal exited with code: " + exitCode4);

        ProcessBuilder removeCdktfProcessBuilder = new ProcessBuilder("rm", "-rf", workingDir + "/cdktf.out/stacks/" + awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId());
        removeCdktfProcessBuilder.directory(dockerfilePath.getParent().toFile());
        Process removeCdktfProcess = removeCdktfProcessBuilder.start();
        int exitCode5 = removeCdktfProcess.waitFor();
        System.out.println("Docker cdktf removal exited with code: " + exitCode5 + "\n");

        return arcDto;
    }

    @Override
    public Map<String,String> deleteArc(ArcDto arcDto) {

        String bucketName = "arc-deploy-terraform-state";
        String workingDir = "/opt/app";

        try {
            String arcName = arcDto.getArc().replaceAll("\\s", "").toLowerCase();
            List<AwsCloud> awsCloud = arcDto.getAws();

            String dockerfileContent = "FROM shubhamb756/ubuntu-terraform:3.0\n" +
                    "WORKDIR " + workingDir + "\n" +
                    "RUN ./destroy.sh " + awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId() + " " + bucketName + "> /dev/null 2>&1";

            // Specify the path where the Dockerfile will be created
            Path dockerfilePath = Path.of(workingDir + "/DockerfileDelete-" + awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId());
            Files.createDirectories(dockerfilePath.getParent());

            // Write the content to the Dockerfile
            Files.writeString(dockerfilePath, dockerfileContent, StandardOpenOption.CREATE);

            ProcessBuilder pruneProcessBuilder = new ProcessBuilder("docker", "builder", "prune", "--all", "--force");
            pruneProcessBuilder.directory(dockerfilePath.getParent().toFile());
            Process pruneProcess = pruneProcessBuilder.start();
            int exitCode1 = pruneProcess.waitFor();
            System.out.println("Docker prune builder exited with code: " + exitCode1 + "\n");

            // Build the Docker image
            ProcessBuilder processBuilder = new ProcessBuilder("docker", "build", "-t", "delete-" + awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId(), "-f", dockerfilePath.toString(), workingDir + "/.");
            processBuilder.directory(dockerfilePath.getParent().toFile());
            Process dockerRunProcess = processBuilder.start();
            int exitCode2 = dockerRunProcess.waitFor();
            System.out.println("Docker build process exited with code: " + exitCode2);

            Files.deleteIfExists(dockerfilePath);

            ProcessBuilder imageRemoveBuilder = new ProcessBuilder("docker", "rmi", "-f", "delete-" + awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId());
            imageRemoveBuilder.directory(dockerfilePath.getParent().toFile());
            Process imageRemoveProcess = imageRemoveBuilder.start();
            int exitCode3 = imageRemoveProcess.waitFor();
            System.out.println("Docker image removal exited with code: " + exitCode3);

            ProcessBuilder noneImageProcessBuilder = new ProcessBuilder("docker", "images", "-q", "--filter", "\"dangling=true\"", "|", "xargs", "docker", "rmi");
            noneImageProcessBuilder.directory(dockerfilePath.getParent().toFile());
            Process noneImageRemoveProcess = noneImageProcessBuilder.start();
            int exitCode4 = noneImageRemoveProcess.waitFor();
            System.out.println("Docker non image removal exited with code: " + exitCode4);

            ProcessBuilder removeCdktfProcessBuilder = new ProcessBuilder("rm", "-rf", workingDir + "/cdktf.out/stacks/" + awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId());
            removeCdktfProcessBuilder.directory(dockerfilePath.getParent().toFile());
            Process removeCdktfProcess = removeCdktfProcessBuilder.start();
            int exitCode5 = removeCdktfProcess.waitFor();
            System.out.println("Docker cdktf removal exited with code: " + exitCode5 + "\n");

            return Map.of("message", "Deleted");

        } catch (Exception e) {

            return Map.of("message", "Error Deleting the Architecture");
        }

    }

    @Override
    public ArcDto updateArc(ArcDto arcDto) throws IOException, InterruptedException {

        return null;
    }

    @Override
    public List<ArcDto> showAllArc() {
        return arcDtosList;
    }
}
