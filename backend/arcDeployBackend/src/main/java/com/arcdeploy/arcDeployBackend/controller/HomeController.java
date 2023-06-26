package com.arcdeploy.arcDeployBackend.controller;

import com.arcdeploy.arcDeployBackend.dto.ArcDto;
import com.arcdeploy.arcDeployBackend.service.ArcService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@CrossOrigin(origins={"*"})
@RestController
@RequestMapping("/arc")
public class HomeController {

    @Autowired
    private ArcService arcService;

    @GetMapping
    public List<ArcDto> retrieveArc(){
        return arcService.showAllArc();
    }
    @PostMapping
    public ArcDto publishArc(@RequestBody ArcDto arcDto) throws IOException, InterruptedException {
        return arcService.saveArc(arcDto);
    }

    @DeleteMapping
    public JSONObject deleteArc(@RequestBody ArcDto arcDto) throws IOException, InterruptedException {
        return arcService.deleteArc(arcDto);
    }
}
