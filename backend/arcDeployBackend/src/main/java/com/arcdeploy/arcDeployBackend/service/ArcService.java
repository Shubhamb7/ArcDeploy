package com.arcdeploy.arcDeployBackend.service;

import com.arcdeploy.arcDeployBackend.dto.ArcDto;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface ArcService {
    ArcDto saveArc(ArcDto arcDto) throws IOException, InterruptedException;
    Map<String,String> deleteArc(ArcDto arcDto);

    ArcDto updateArc(ArcDto arcDto) throws IOException, InterruptedException;
    List<ArcDto> showAllArc();
}
