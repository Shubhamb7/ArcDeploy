package com.arcdeploy.arcDeployBackend.service;

import com.arcdeploy.arcDeployBackend.dto.ArcDto;
import org.json.JSONObject;

import java.io.IOException;
import java.util.List;

public interface ArcService {
    ArcDto saveArc(ArcDto arcDto) throws IOException, InterruptedException;
    JSONObject deleteArc(ArcDto arcDto);

    ArcDto updateArc(ArcDto arcDto) throws IOException, InterruptedException;
    List<ArcDto> showAllArc();
}
