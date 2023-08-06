package com.arcdeploy.arcDeployBackend.controller;

import com.arcdeploy.arcDeployBackend.dto.ArcDto;
import com.arcdeploy.arcDeployBackend.service.ArcService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    public ResponseEntity<?> publishArc(@RequestBody ArcDto arcDto) throws IOException, InterruptedException {
        return ResponseEntity.status(201).body(arcService.saveArc(arcDto));
    }

    @PutMapping
    public ResponseEntity<?> modifyArc(@RequestBody ArcDto arcDto) throws IOException, InterruptedException {
        return ResponseEntity.ok(arcService.updateArc(arcDto));
    }

    @DeleteMapping
    public ResponseEntity<?> deleteArc(@RequestBody ArcDto arcDto) throws IOException, InterruptedException {
        return ResponseEntity.ok(arcService.deleteArc(arcDto));
    }
}
