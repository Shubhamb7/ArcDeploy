package com.arcdeploy.arcDeployBackend.model;

import com.amazonaws.services.dynamodbv2.xspec.S;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@NoArgsConstructor
@AllArgsConstructor
@Data
@ToString
public class OpenVPN {
    private String name;
    private String tagName;
    private String type;
    private String instanceType;
    private String userCount;
    private String keyPair;
    private String ephemeralStorage;
    private String vpnUsername;
    private String vpnPasswd;
}
