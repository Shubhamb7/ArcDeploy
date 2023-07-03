package com.arcdeploy.arcDeployBackend.service;

import com.arcdeploy.arcDeployBackend.awscdktf.MyAwsStack;
import com.arcdeploy.arcDeployBackend.dto.ArcDto;
import com.arcdeploy.arcDeployBackend.model.*;
import com.hashicorp.cdktf.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
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

        String arcName = arcDto.getArc().replaceAll("\\s", "").toLowerCase();
        List<AwsCloud> awsCloud = arcDto.getAws();

        App app = new App();
        MyAwsStack awsStack = new MyAwsStack(app, awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId(), arcDto);
        awsStack.toTerraform();
        app.synth();

        String dockerfileContent = "FROM shubhamb756/ubuntu-terraform:latest\n" +
                "WORKDIR /home/ubuntu/app\n" +
                "COPY cdktf.out/stacks/" + awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId() + "/cdk.tf.json /home/ubuntu/app/.\n" +
                "RUN terraform init\n" +
                "RUN terraform apply --auto-approve\n" +
                "RUN git clone -b master https://Shubhamb7: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@github.com/Shubhamb7/terraform-states-manage.git\n" +
                "WORKDIR /home/ubuntu/app/terraform-states-manage\n" +
                "RUN git init\n" +
                "RUN git config --global user.email shubhamb756@gmail.com\n" +
                "RUN git config --global user.name Shubhamb7\n" +
                "RUN git checkout -b " + awsCloud.get(0).getProjectName() + arcName + awsCloud.get(0).getAcId() +
                "\nRUN mv ../terraform." + awsCloud.get(0).getProjectName() + arcName + awsCloud.get(0).getAcId() + ".tfstate ./\n" +
                "RUN mv ../cdk.tf.json ./\n" +
                "RUN git add .\n" +
                "RUN git commit -m \""+ awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId() + "\"\n" +
                "RUN git push origin "+ awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId();

        // Specify the path where the Dockerfile will be created
        Path dockerfilePath = Path.of("/home/ubuntu/app/Dockerfile-" + awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId());
        Files.createDirectories(dockerfilePath.getParent());

        ProcessBuilder pruneProcessBuilder = new ProcessBuilder("docker", "builder", "prune", "--all", "--force");
        pruneProcessBuilder.directory(dockerfilePath.getParent().toFile());
        Process pruneProcess = pruneProcessBuilder.start();
        int exitCode1 = pruneProcess.waitFor();
        System.out.println("Docker prune builder exited with code: " + exitCode1 + "\n");

        // Write the content to the Dockerfile
        Files.writeString(dockerfilePath, dockerfileContent, StandardOpenOption.CREATE);
        // Build the Docker image
        ProcessBuilder imageBuildBuilder = new ProcessBuilder("docker", "build", "-t", awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId(), "-f", dockerfilePath.toString(), "/home/ubuntu/app/.");
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

        ProcessBuilder removeCdktfProcessBuilder = new ProcessBuilder("rm", "-rf", "/home/ubuntu/app/cdktf.out");
        removeCdktfProcessBuilder.directory(dockerfilePath.getParent().toFile());
        Process removeCdktfProcess = removeCdktfProcessBuilder.start();
        int exitCode5 = removeCdktfProcess.waitFor();
        System.out.println("Docker cdktf removal exited with code: " + exitCode5 + "\n");

        return arcDto;
    }

    @Override
    public Map<String,String> deleteArc(ArcDto arcDto) {

        String arcName = arcDto.getArc().replaceAll("\\s", "").toLowerCase();
        List<AwsCloud> awsCloud = arcDto.getAws();
        String owner = "Shubhamb7";
        String repo = "terraform-states-manage";
        String token = "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";

        try {
            HttpClient httpClient = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder().uri(URI.create("https://api.github.com/repos/" + owner + "/" + repo + "/branches"))
                    .header("Authorization", "Bearer " + token)
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JSONArray branchesArray = new JSONArray(response.body());
            String[] branchNames = new String[branchesArray.length()];

            for (int i = 0; i < branchesArray.length(); i++) {
                JSONObject branchObj = branchesArray.getJSONObject(i);
                String branchName = branchObj.getString("name");
                branchNames[i] = branchName;
            }

            for(String name: branchNames) {
                if (name.equals(awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId())) {

                    String dockerfileContent = "FROM shubhamb756/ubuntu-terraform:latest\n" +
                            "WORKDIR /home/ubuntu/app\n" +
                            "RUN git clone -b " + awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId() + " https://Shubhamb7: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@github.com/Shubhamb7/terraform-states-manage.git\n" +
                            "RUN mv terraform-states-manage/terraform."+ awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId() +".tfstate ./\n" +
                            "RUN mv terraform-states-manage/cdk.tf.json ./\n" +
                            "RUN terraform init \n" +
                            "RUN terraform destroy --auto-approve \n" +
                            "WORKDIR /home/ubuntu/app/terraform-states-manage \n" +
                            "RUN git init \n" +
                            "RUN git checkout master\n" +
                            "RUN git config --global user.email shubhamb756@gmail.com\n" +
                            "RUN git config --global user.name Shubhamb7\n" +
                            "RUN git push origin --delete " + awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId();
    
                    // Specify the path where the Dockerfile will be created
                    Path dockerfilePath = Path.of("/home/ubuntu/app/DockerfileDelete-" + awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId());
                    Files.createDirectories(dockerfilePath.getParent());

                    // Write the content to the Dockerfile
                    Files.writeString(dockerfilePath, dockerfileContent, StandardOpenOption.CREATE);

                    ProcessBuilder pruneProcessBuilder = new ProcessBuilder("docker", "builder", "prune", "--all", "--force");
                    pruneProcessBuilder.directory(dockerfilePath.getParent().toFile());
                    Process pruneProcess = pruneProcessBuilder.start();
                    int exitCode1 = pruneProcess.waitFor();
                    System.out.println("Docker prune builder exited with code: " + exitCode1 + "\n");

                    // Build the Docker image
                    ProcessBuilder processBuilder = new ProcessBuilder("docker", "build", "-t", "delete-" + awsCloud.get(0).getProjectName() + arcName +  awsCloud.get(0).getAcId(), "-f", dockerfilePath.toString(), "/home/ubuntu/app/.");
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

                    ProcessBuilder removeCdktfProcessBuilder = new ProcessBuilder("rm", "-rf", "/home/ubuntu/app/cdktf.out");
                    removeCdktfProcessBuilder.directory(dockerfilePath.getParent().toFile());
                    Process removeCdktfProcess = removeCdktfProcessBuilder.start();
                    int exitCode5 = removeCdktfProcess.waitFor();
                    System.out.println("Docker cdktf removal exited with code: " + exitCode5 + "\n");

                    return Map.of("message", "Deleted");
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return Map.of("message", "Error Deleting the Architecture");

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
