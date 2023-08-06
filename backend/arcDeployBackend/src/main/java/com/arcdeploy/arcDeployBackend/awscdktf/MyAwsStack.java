package com.arcdeploy.arcDeployBackend.awscdktf;

import com.arcdeploy.arcDeployBackend.dto.ArcDto;
import com.arcdeploy.arcDeployBackend.model.*;

import com.hashicorp.cdktf.TerraformStack;
import com.hashicorp.cdktf.providers.aws.alb_listener.*;
import com.hashicorp.cdktf.providers.aws.alb_listener_rule.*;
import com.hashicorp.cdktf.providers.aws.alb_target_group.AlbTargetGroup;
import com.hashicorp.cdktf.providers.aws.alb_target_group_attachment.AlbTargetGroupAttachment;
import com.hashicorp.cdktf.providers.aws.eip.Eip;
import com.hashicorp.cdktf.providers.aws.internet_gateway.InternetGateway;
import com.hashicorp.cdktf.providers.aws.nat_gateway.NatGateway;
import com.hashicorp.cdktf.providers.aws.route_table.RouteTable;
import com.hashicorp.cdktf.providers.aws.route_table.RouteTableRoute;
import com.hashicorp.cdktf.providers.aws.route_table_association.RouteTableAssociation;
import com.hashicorp.cdktf.providers.aws.data_aws_ami.DataAwsAmi;
import com.hashicorp.cdktf.providers.aws.data_aws_ami.DataAwsAmiFilter;
import com.hashicorp.cdktf.providers.aws.instance.Instance;
import com.hashicorp.cdktf.providers.aws.instance.InstanceRootBlockDevice;
import com.hashicorp.cdktf.providers.aws.provider.AwsProvider;
import com.hashicorp.cdktf.providers.aws.provider.AwsProviderConfig;
import com.hashicorp.cdktf.providers.aws.security_group.SecurityGroup;
import com.hashicorp.cdktf.providers.aws.security_group.SecurityGroupEgress;
import com.hashicorp.cdktf.providers.aws.security_group.SecurityGroupIngress;
import com.hashicorp.cdktf.providers.aws.vpc_security_group_egress_rule.VpcSecurityGroupEgressRule;
import com.hashicorp.cdktf.providers.aws.vpc_security_group_ingress_rule.VpcSecurityGroupIngressRule;
import software.constructs.Construct;

import java.security.Security;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

public class MyAwsStack extends TerraformStack {
    public MyAwsStack(final Construct scope, final String id, final ArcDto arcDto) {
        super(scope, id);

        List<AwsCloud> awsClouds = arcDto.getAws();
        List<Region> regions = arcDto.getRegions();
        List<Vpc> vpcs = arcDto.getVpcs();
        List<Subnet> subnets = arcDto.getSubnets();
        List<Nat> nats = arcDto.getNats();
        List<SG> sgs = arcDto.getSgs();
        List<TG> tgs = arcDto.getTgs();
        List<Alb> albs = arcDto.getAlbs();
        List<Ec2> instances = arcDto.getInstances();
        List<OpenVPN> openvpns = arcDto.getOpenvpns();

        int regionIndex = 0;
        int vpcIndex = 0;
        int subnetIndex = 0;
        int igwIndex = 0;
        int natIndex = 0;
        int sgIndex = 0;
        int sgRuleCount = 0;
        int instanceIndex = 0;
        int openVpnIndex = 0;
        int listenerIndex = 0;
        int listenerRuleIndex = 0;

        for (int i = 0; i < awsClouds.size(); i++) {

            for (int j = 0; j < regions.size(); j++) {

                for (Region tempRegion: awsClouds.get(i).getRegions()) {

                    if (tempRegion.getRegionName().equals(regions.get(j).getRegionName())
                            && tempRegion.getName().equals(regions.get(j).getName())){

                        AwsProvider provider = new AwsProvider(this, regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + regionIndex,
                                AwsProviderConfig.builder().region(regions.get(j).getRegionName()).build());
                        provider.setAccessKey(awsClouds.get(i).getAccessKey());
                        provider.setSecretKey(awsClouds.get(i).getSecretKey());
                        provider.setAllowedAccountIds(List.of(awsClouds.get(i).getAcId()));
                        provider.setRegion(regions.get(j).getRegionName());
                        provider.setAlias("aws-" + regions.get(j).getRegionName().split("-")[0] + "-" + regions.get(j).getRegionName().split("-")[1]);

                        DataAwsAmi ubuntu2004AmiData = DataAwsAmi.Builder.create(this, "ubuntu20.04-ami-" + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId())
                                .mostRecent(true)
                                .filter(List.of(
                                        DataAwsAmiFilter.builder()
                                                .name("name")
                                                .values(List.of("ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"))
                                                .build(),
                                        DataAwsAmiFilter.builder()
                                                .name("virtualization-type")
                                                .values(List.of("hvm"))
                                                .build(),
                                        DataAwsAmiFilter.builder()
                                                .name("architecture")
                                                .values(List.of("x86_64"))
                                                .build()
                                ))
                                .owners(List.of("099720109477")) // Canonical official
                                .provider(provider)
                                .build();

                        DataAwsAmi ubuntu2204AmiData = DataAwsAmi.Builder.create(this, "ubuntu22.04-ami" + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId())
                                .mostRecent(true)
                                .filter(List.of(
                                        DataAwsAmiFilter.builder()
                                                .name("name")
                                                .values(List.of("ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"))
                                                .build(),
                                        DataAwsAmiFilter.builder()
                                                .name("virtualization-type")
                                                .values(List.of("hvm"))
                                                .build(),
                                        DataAwsAmiFilter.builder()
                                                .name("architecture")
                                                .values(List.of("x86_64"))
                                                .build()
                                ))
                                .owners(List.of("099720109477")) // Canonical official
                                .provider(provider)
                                .build();

                        DataAwsAmi debian11AmiData = DataAwsAmi.Builder.create(this, "debian11-ami" + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId())
                                .mostRecent(true)
                                .filter(List.of(
                                        DataAwsAmiFilter.builder()
                                                .name("name")
                                                .values(List.of("debian-11-amd64-*"))
                                                .build(),
                                        DataAwsAmiFilter.builder()
                                                .name("virtualization-type")
                                                .values(List.of("hvm"))
                                                .build(),
                                        DataAwsAmiFilter.builder()
                                                .name("architecture")
                                                .values(List.of("x86_64"))
                                                .build()
                                ))
                                .owners(List.of("136693071363")) // Debian
                                .provider(provider)
                                .build();

                        DataAwsAmi openVpn5 = DataAwsAmi.Builder.create(this, "openvpn5-ami" + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId())
                                .mostRecent(true)
                                .filter(List.of(
                                        DataAwsAmiFilter.builder()
                                                .name("name")
                                                .values(List.of("OpenVPN Access Server QA Image-3b5882c4-551b-43fa-acfe-7f5cdb896ff1*"))
                                                .build(),
                                        DataAwsAmiFilter.builder()
                                                .name("virtualization-type")
                                                .values(List.of("hvm"))
                                                .build(),
                                        DataAwsAmiFilter.builder()
                                                .name("architecture")
                                                .values(List.of("x86_64"))
                                                .build()
                                ))
                                .owners(List.of("679593333241")) // OpenVPN
                                .provider(provider)
                                .build();

                        DataAwsAmi openVpn10 = DataAwsAmi.Builder.create(this, "openvpn10-ami" + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId())
                                .mostRecent(true)
                                .filter(List.of(
                                        DataAwsAmiFilter.builder()
                                                .name("name")
                                                .values(List.of("OpenVPN Access Server QA Image-8fbe3379-63b6-43e8-87bd-0e93fd7be8f3*"))
                                                .build(),
                                        DataAwsAmiFilter.builder()
                                                .name("virtualization-type")
                                                .values(List.of("hvm"))
                                                .build(),
                                        DataAwsAmiFilter.builder()
                                                .name("architecture")
                                                .values(List.of("x86_64"))
                                                .build()
                                ))
                                .owners(List.of("679593333241")) // OpenVPN
                                .provider(provider)
                                .build();

                        DataAwsAmi openVpn25 = DataAwsAmi.Builder.create(this, "openvpn25-ami" + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId())
                                .mostRecent(true)
                                .filter(List.of(
                                        DataAwsAmiFilter.builder()
                                                .name("name")
                                                .values(List.of("OpenVPN Access Server QA Image-23223b90-d61f-472a-b732-f2b98e6fa3fb*"))
                                                .build(),
                                        DataAwsAmiFilter.builder()
                                                .name("virtualization-type")
                                                .values(List.of("hvm"))
                                                .build(),
                                        DataAwsAmiFilter.builder()
                                                .name("architecture")
                                                .values(List.of("x86_64"))
                                                .build()
                                ))
                                .owners(List.of("679593333241")) // OpenVPN
                                .provider(provider)
                                .build();

                        for (int k = 0; k < vpcs.size(); k++) {

                            com.hashicorp.cdktf.providers.aws.vpc.Vpc vpcDeployment = null;
                            com.hashicorp.cdktf.providers.aws.subnet.Subnet subnetDeployment = null;
                            List<com.hashicorp.cdktf.providers.aws.subnet.Subnet> privateSubnetList = new ArrayList<>();
                            List<String> privateSubnetCidrList = new ArrayList<>();
                            List<com.hashicorp.cdktf.providers.aws.subnet.Subnet> publicSubnetList = new ArrayList<>();
                            List<String> publicSubnetCidrList = new ArrayList<>();

                            InternetGateway igwDeployment;
                            NatGateway natGateway;
                            RouteTable publicRouteTable = null;
                            RouteTable privateRouteTable = null;
                            SecurityGroup securityGroup = null;
                            List<SecurityGroup> securityGroupList = new ArrayList<>();
                            Map<String, String> sgMap = new HashMap<>();
                            Map<String, String> openVpnSgMap = new HashMap<>();
                            Map<String, String> albSgMap = new HashMap<>();
                            Map<String, String> sgIdMap = new HashMap<>();
                            Map<SecurityGroup,List<SgRule>> ingressRulesMap = new HashMap<>();
                            Map<String,String> publicSubnetMap = new HashMap<>();
                            Map<String,String> privateSubnetMap = new HashMap<>();

                            AlbTargetGroup tg = null;
                            Map<String, AlbTargetGroup> tgMap = new HashMap<>();
                            Map<String, String> tgDeploymentArnMap = new HashMap<>();
                            List<com.hashicorp.cdktf.providers.aws.alb.Alb> albList = new ArrayList<>();
                            Map<String,String> listenerMap = new HashMap<>();

                            for (Vpc tempVpc: regions.get(j).getVpcs()){

                                if (tempVpc.getName().equals(vpcs.get(k).getName())
                                        && tempVpc.getCidr().equals(vpcs.get(k).getCidr())){

                                    vpcDeployment = com.hashicorp.cdktf.providers.aws.vpc.Vpc.Builder.create(this, vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + vpcIndex)
                                            .cidrBlock(vpcs.get(k).getCidr())
                                            .enableDnsHostnames(true)
                                            .enableDnsSupport(true)
                                            .tags(Map.of("Name", awsClouds.get(i).getProjectName() + "-" + vpcs.get(k).getTagName()))
                                            .provider(provider)
                                            .build();

                                    if (vpcs.get(k).getIgw()) {
                                        igwDeployment = InternetGateway.Builder.create(this, vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + "IGW" + igwIndex)
                                                .vpcId(vpcDeployment.getId())
                                                .tags(Map.of("Name", awsClouds.get(i).getProjectName() + "-" + vpcs.get(k).getTagName() + "-IGW"))
                                                .provider(provider)
                                                .build();

                                        publicRouteTable = RouteTable.Builder.create(this, vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + "Public-Route-Table" + igwIndex)
                                                .vpcId(vpcDeployment.getId())
                                                .provider(provider)
                                                .route(List.of(RouteTableRoute.builder().cidrBlock("0.0.0.0/0")
                                                        .gatewayId(igwDeployment.getId()).build()))
                                                .tags(Map.of("Name", awsClouds.get(i).getProjectName() + "-" + vpcs.get(k).getTagName() + "-public-rt"))
                                                .build();
                                    }

                                    if(!vpcs.get(k).getSgs().isEmpty()){

                                        for (int sgLoopIndex=0; sgLoopIndex<vpcs.get(k).getSgs().size(); sgLoopIndex++){

                                            for( SG tempSg: sgs) {

                                                if (tempSg.getName().equals(vpcs.get(k).getSgs().get(sgLoopIndex).getName())) {

                                                        List<SgRule> ingressRulesList = new ArrayList<>();

                                                        securityGroup = SecurityGroup.Builder.create(this, vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + "SG" + sgIndex + vpcIndex + regionIndex)
                                                                .vpcId(vpcDeployment.getId())
                                                                .name(awsClouds.get(i).getProjectName() + "-" + tempSg.getTagName() + "-" + tempSg.getName())
                                                                .egress(List.of(
                                                                        SecurityGroupEgress.builder()
                                                                                .fromPort(0)
                                                                                .toPort(0)
                                                                                .protocol("-1")
                                                                                .cidrBlocks(List.of("0.0.0.0/0"))
                                                                                .ipv6CidrBlocks(List.of("::/0")).build()
                                                                ))
                                                                .tags(Map.of("Name", awsClouds.get(i).getProjectName() + "-" + vpcs.get(k).getTagName() + "-" + tempSg.getTagName()))
                                                                .provider(provider)
                                                                .build();

                                                        for ( int sgRuleIndex = 0; sgRuleIndex<tempSg.getSgRules().size(); sgRuleIndex++){
                                                            SgRule rule = new SgRule();
                                                            rule.setProtocol(tempSg.getSgRules().get(sgRuleIndex).getProtocol());
                                                            rule.setPort(tempSg.getSgRules().get(sgRuleIndex).getPort());
                                                            rule.setSourceIp(tempSg.getSgRules().get(sgRuleIndex).getSourceIp());
                                                            ingressRulesList.add(rule);
                                                        }

                                                        ingressRulesMap.put(securityGroup, ingressRulesList);
                                                        securityGroupList.add(securityGroup);

                                                        for (int instanceNameIndex=0; instanceNameIndex<tempSg.getInstances().size(); instanceNameIndex ++){
                                                            sgMap.put(tempSg.getInstances().get(instanceNameIndex).getName(), securityGroup.getId());
                                                        }

                                                        for (int albNameIndex=0; albNameIndex<tempSg.getAlbs().size(); albNameIndex ++) {
                                                            albSgMap.put(tempSg.getAlbs().get(albNameIndex).getName(), securityGroup.getId());
                                                        }

                                                        for (int openVpnNameIndex=0; openVpnNameIndex<tempSg.getOpenvpns().size(); openVpnNameIndex ++) {
                                                            openVpnSgMap.put(tempSg.getOpenvpns().get(openVpnNameIndex).getName(), securityGroup.getId());
                                                        }

                                                        sgIdMap.put(tempSg.getName(), securityGroup.getId());
                                                    }

                                            }

                                            sgIndex ++;
                                        }

                                        for (SecurityGroup sg: securityGroupList){

                                            for (SgRule ingressRule: ingressRulesMap.get(sg)){

                                                Pattern pattern = Pattern.compile("^\\d{1,3}(\\.\\d{1,3}){3}/\\d{1,2}$");

                                                if(pattern.matcher(ingressRule.getSourceIp()).matches()){
                                                    VpcSecurityGroupIngressRule tempIngress = VpcSecurityGroupIngressRule.Builder.create(this, vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + "SGRule" + sgRuleCount++ + vpcIndex + regionIndex)
                                                            .fromPort(Integer.parseInt(ingressRule.getPort()))
                                                            .toPort(Integer.parseInt(ingressRule.getPort()))
                                                            .ipProtocol(ingressRule.getProtocol())
                                                            .cidrIpv4(ingressRule.getSourceIp())
                                                            .securityGroupId(sg.getId())
                                                            .provider(provider)
                                                            .build();
                                                } else {
                                                    VpcSecurityGroupIngressRule tempIngress = VpcSecurityGroupIngressRule.Builder.create(this, vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + "SGRule" + sgRuleCount++ + vpcIndex + regionIndex)
                                                            .fromPort(Integer.parseInt(ingressRule.getPort()))
                                                            .toPort(Integer.parseInt(ingressRule.getPort()))
                                                            .ipProtocol(ingressRule.getProtocol())
                                                            .referencedSecurityGroupId(sgIdMap.get(ingressRule.getSourceIp()))
                                                            .securityGroupId(sg.getId())
                                                            .provider(provider)
                                                            .build();
                                                }
                                            }
                                        }
                                    }

                                    if(!vpcs.get(k).getTgs().isEmpty()){

                                        for(int tgLoopIndex = 0; tgLoopIndex<vpcs.get(k).getTgs().size(); tgLoopIndex ++){

                                            for(TG tempTg: tgs){

                                                if(tempTg.getName().equals(vpcs.get(k).getTgs().get(tgLoopIndex).getName())){

                                                    tg = AlbTargetGroup.Builder.create(this, tempTg.getName() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId())
                                                            .vpcId(vpcDeployment.getId())
                                                            .port(Integer.parseInt(tempTg.getPort()))
                                                            .protocol(tempTg.getProtocol())
                                                            .protocolVersion(tempTg.getProtocolVer())
                                                            .name(awsClouds.get(i).getProjectName() + "-" + vpcs.get(k).getTagName() + "-" + tempTg.getTagName())
                                                            .provider(provider)
                                                            .build();

                                                    for(Ec2 tempInstance: tempTg.getInstances()){
                                                        tgMap.put(tempInstance.getName(),tg);
                                                        tgDeploymentArnMap.put(tempTg.getName(), tg.getArn());
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            for (int l = 0; l < subnets.size(); l++) {

                                for (Subnet tempSubnet : vpcs.get(k).getSubnets()) {

                                    if (tempSubnet.getName().equals(subnets.get(l).getName())
                                            && tempSubnet.getSubnetCidr().equals(subnets.get(l).getSubnetCidr())
                                            && tempSubnet.getAvailabilityZone().equals(subnets.get(l).getAvailabilityZone())
                                            && vpcDeployment != null) {

                                        if (subnets.get(l).getType().equals("Subnet")) {

                                            subnetDeployment = com.hashicorp.cdktf.providers.aws.subnet.Subnet.Builder.create(this, subnets.get(l).getName() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + subnetIndex)
                                                    .cidrBlock(subnets.get(l).getSubnetCidr())
                                                    .availabilityZone(subnets.get(l).getAvailabilityZone())
                                                    .vpcId(vpcDeployment.getId())
                                                    .mapPublicIpOnLaunch(true)
                                                    .tags(Map.of("Name", awsClouds.get(i).getProjectName() + "-" + subnets.get(l).getTagName()))
                                                    .provider(provider)
                                                    .build();

                                            publicSubnetMap.put(subnets.get(l).getName(), subnetDeployment.getId());

                                            if(subnets.get(l).getNat()){
                                                publicSubnetList.add(subnetDeployment);
                                                publicSubnetCidrList.add(subnets.get(l).getSubnetCidr());
                                            }

                                            if (vpcs.get(k).getIgw() && publicRouteTable != null) {
                                                RouteTableAssociation.Builder.create(this, subnets.get(l).getName() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + "Route-Table-Association" + subnetIndex)
                                                        .provider(provider)
                                                        .subnetId(subnetDeployment.getId())
                                                        .routeTableId(publicRouteTable.getId())
                                                        .build();
                                            }

                                        } else {

                                            subnetDeployment = com.hashicorp.cdktf.providers.aws.subnet.Subnet.Builder.create(this, subnets.get(l).getName() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + subnetIndex)
                                                    .cidrBlock(subnets.get(l).getSubnetCidr())
                                                    .availabilityZone(subnets.get(l).getAvailabilityZone())
                                                    .vpcId(vpcDeployment.getId())
                                                    .tags(Map.of("Name", awsClouds.get(i).getProjectName() + "-" + subnets.get(l).getTagName()))
                                                    .provider(provider)
                                                    .build();

                                            privateSubnetList.add(subnetDeployment);
                                            privateSubnetCidrList.add(subnets.get(l).getSubnetCidr());
                                            privateSubnetMap.put(subnets.get(l).getName(), subnetDeployment.getId());

                                        }
                                    }
                                }

                                for (int m = 0; m < instances.size(); m++) {

                                    for (Ec2 tempEc2 : subnets.get(l).getInstances()) {

                                        if (subnetDeployment != null && tempEc2.getName().equals(instances.get(m).getName())
                                                && tempEc2.getInstanceType().equals(instances.get(m).getInstanceType())
                                                && tempEc2.getKeyPair().equals(instances.get(m).getKeyPair())
                                                && tempEc2.getOperatingSystem().equals(instances.get(m).getOperatingSystem())
                                                && tempEc2.getOperatingSystemVersion().equals(instances.get(m).getOperatingSystemVersion())
                                                && tempEc2.getEphemeralStorage().equals(instances.get(m).getEphemeralStorage())) {

                                            if (instances.get(m).getOperatingSystem().equals("ubuntu")) {

                                                if (instances.get(m).getOperatingSystemVersion().equals("20.04")) {

                                                    if (sgMap.containsKey(instances.get(m).getName())){

                                                        Instance instanceDeployment = Instance.Builder.create(this, instances.get(m).getName() + subnets.get(l).getName() + subnets.get(l).getSubnetCidr() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + instanceIndex)
                                                                .instanceType(instances.get(m).getInstanceType())
                                                                .ami(ubuntu2004AmiData.getId())
                                                                .subnetId(subnetDeployment.getId())
                                                                .vpcSecurityGroupIds(List.of(
                                                                                sgMap.get(instances.get(m).getName())
                                                                ))
                                                                .rootBlockDevice(InstanceRootBlockDevice.builder()
                                                                        .volumeSize(Integer.parseInt(instances.get(m).getEphemeralStorage())).build())
                                                                .keyName(instances.get(m).getKeyPair())
                                                                .tags(Map.of("Name", awsClouds.get(i).getProjectName() + "-" + instances.get(m).getTagName()))
                                                                .userData(instances.get(m).getUserData())
                                                                .provider(provider)
                                                                .build();

                                                        if(tgMap.containsKey(instances.get(m).getName())){
                                                            AlbTargetGroup tempTg = tgMap.get(instances.get(m).getName());

                                                            AlbTargetGroupAttachment.Builder.create(this,  tempTg.getTags().get("Name") + instances.get(m).getName() + subnets.get(l).getName() + subnets.get(l).getSubnetCidr() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + instanceIndex)
                                                                    .targetGroupArn(tempTg.getArn())
                                                                    .targetId(instanceDeployment.getId())
                                                                    .provider(provider)
                                                                    .build();
                                                        }
                                                    }

                                                } else {

                                                    if (sgMap.containsKey(instances.get(m).getName())){

                                                        Instance instanceDeployment = Instance.Builder.create(this, instances.get(m).getName() + subnets.get(l).getName() + subnets.get(l).getSubnetCidr() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + instanceIndex)
                                                                .instanceType(instances.get(m).getInstanceType())
                                                                .ami(ubuntu2204AmiData.getId())
                                                                .subnetId(subnetDeployment.getId())
                                                                .vpcSecurityGroupIds(List.of(
                                                                        sgMap.get(instances.get(m).getName())
                                                                ))
                                                                .rootBlockDevice(InstanceRootBlockDevice.builder()
                                                                        .volumeSize(Integer.parseInt(instances.get(m).getEphemeralStorage())).build())
                                                                .keyName(instances.get(m).getKeyPair())
                                                                .tags(Map.of("Name", awsClouds.get(i).getProjectName() + "-" + instances.get(m).getTagName()))
                                                                .userData(instances.get(m).getUserData())
                                                                .provider(provider)
                                                                .build();

                                                        if(tgMap.containsKey(instances.get(m).getName())){
                                                            AlbTargetGroup tempTg = tgMap.get(instances.get(m).getName());

                                                            AlbTargetGroupAttachment.Builder.create(this,  tempTg.getTags().get("Name") + instances.get(m).getName() + subnets.get(l).getName() + subnets.get(l).getSubnetCidr() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + instanceIndex)
                                                                    .targetGroupArn(tempTg.getArn())
                                                                    .targetId(instanceDeployment.getId())
                                                                    .provider(provider)
                                                                    .build();
                                                        }
                                                    }
                                                }
                                            } else {

                                                if (sgMap.containsKey(instances.get(m).getName())){

                                                    Instance instanceDeployment = Instance.Builder.create(this, instances.get(m).getName() + subnets.get(l).getName() + subnets.get(l).getSubnetCidr() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + instanceIndex)
                                                            .instanceType(instances.get(m).getInstanceType())
                                                            .ami(debian11AmiData.getId())
                                                            .subnetId(subnetDeployment.getId())
                                                            .vpcSecurityGroupIds(List.of(
                                                                    sgMap.get(instances.get(m).getName())
                                                            ))
                                                            .rootBlockDevice(InstanceRootBlockDevice.builder()
                                                                    .volumeSize(Integer.parseInt(instances.get(m).getEphemeralStorage())).build())
                                                            .keyName(instances.get(m).getKeyPair())
                                                            .tags(Map.of("Name", awsClouds.get(i).getProjectName() + "-" + instances.get(m).getTagName()))
                                                            .userData(instances.get(m).getUserData())
                                                            .provider(provider)
                                                            .build();

                                                    if(tgMap.containsKey(instances.get(m).getName())){
                                                        AlbTargetGroup tempTg = tgMap.get(instances.get(m).getName());

                                                        AlbTargetGroupAttachment.Builder.create(this,  tempTg.getTags().get("Name") + instances.get(m).getName() + subnets.get(l).getName() + subnets.get(l).getSubnetCidr() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + instanceIndex)
                                                                .targetGroupArn(tempTg.getArn())
                                                                .targetId(instanceDeployment.getId())
                                                                .provider(provider)
                                                                .build();
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    instanceIndex ++;
                                }

                                for (int m = 0; m < openvpns.size(); m++) {

                                    for (OpenVPN tempOpenVPN : subnets.get(l).getOpenvpns()) {

                                        if (subnetDeployment != null && tempOpenVPN.getName().equals(openvpns.get(m).getName())
                                                && tempOpenVPN.getInstanceType().equals(openvpns.get(m).getInstanceType())
                                                && tempOpenVPN.getKeyPair().equals(openvpns.get(m).getKeyPair())
                                                && tempOpenVPN.getUserCount().equals(openvpns.get(m).getUserCount())
                                                && tempOpenVPN.getEphemeralStorage().equals(openvpns.get(m).getEphemeralStorage())) {

                                            switch (openvpns.get(m).getUserCount()) {
                                                case "5" -> {
                                                    if (openVpnSgMap.containsKey(openvpns.get(m).getName())) {

                                                        Instance.Builder.create(this, openvpns.get(m).getName() + subnets.get(l).getName() + subnets.get(l).getSubnetCidr() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + openVpnIndex)
                                                                .instanceType(openvpns.get(m).getInstanceType())
                                                                .ami(openVpn5.getId())
                                                                .subnetId(subnetDeployment.getId())
                                                                .vpcSecurityGroupIds(List.of(
                                                                        sgMap.get(instances.get(m).getName())
                                                                ))
                                                                .rootBlockDevice(InstanceRootBlockDevice.builder()
                                                                        .volumeSize(Integer.parseInt(openvpns.get(m).getEphemeralStorage())).build())
                                                                .keyName(openvpns.get(m).getKeyPair())
                                                                .tags(Map.of("Name", awsClouds.get(i).getProjectName() + "-" + openvpns.get(m).getTagName()))
                                                                .userData("admin_user=" + openvpns.get(m).getVpnUsername() + "\nadmin_pw=" + openvpns.get(m).getVpnPasswd())
                                                                .provider(provider)
                                                                .build();
                                                    }
                                                }
                                                case "10" -> {
                                                    if (openVpnSgMap.containsKey(openvpns.get(m).getName())) {

                                                        Instance.Builder.create(this, openvpns.get(m).getName() + subnets.get(l).getName() + subnets.get(l).getSubnetCidr() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + openVpnIndex)
                                                                .instanceType(openvpns.get(m).getInstanceType())
                                                                .ami(openVpn10.getId())
                                                                .subnetId(subnetDeployment.getId())
                                                                .vpcSecurityGroupIds(List.of(
                                                                        sgMap.get(instances.get(m).getName())
                                                                ))
                                                                .rootBlockDevice(InstanceRootBlockDevice.builder()
                                                                        .volumeSize(Integer.parseInt(openvpns.get(m).getEphemeralStorage())).build())
                                                                .keyName(openvpns.get(m).getKeyPair())
                                                                .tags(Map.of("Name", awsClouds.get(i).getProjectName() + "-" + openvpns.get(m).getTagName()))
                                                                .userData("admin_user=" + openvpns.get(m).getVpnUsername() + "\nadmin_pw=" + openvpns.get(m).getVpnPasswd())
                                                                .provider(provider)
                                                                .build();
                                                    }
                                                }
                                                case "25" -> {
                                                    if (openVpnSgMap.containsKey(openvpns.get(m).getName())) {

                                                        Instance.Builder.create(this, openvpns.get(m).getName() + subnets.get(l).getName() + subnets.get(l).getSubnetCidr() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + openVpnIndex)
                                                                .instanceType(openvpns.get(m).getInstanceType())
                                                                .ami(openVpn25.getId())
                                                                .subnetId(subnetDeployment.getId())
                                                                .vpcSecurityGroupIds(List.of(
                                                                        sgMap.get(instances.get(m).getName())
                                                                ))
                                                                .rootBlockDevice(InstanceRootBlockDevice.builder()
                                                                        .volumeSize(Integer.parseInt(openvpns.get(m).getEphemeralStorage())).build())
                                                                .keyName(openvpns.get(m).getKeyPair())
                                                                .tags(Map.of("Name", awsClouds.get(i).getProjectName() + "-" + openvpns.get(m).getTagName()))
                                                                .userData("admin_user=" + openvpns.get(m).getVpnUsername() + "\nadmin_pw=" + openvpns.get(m).getVpnPasswd())
                                                                .provider(provider)
                                                                .build();
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    openVpnIndex ++;
                                }

                                subnetIndex ++;
                            }

                            for(int l=0; l<publicSubnetList.size(); l++){

                                Eip eip = Eip.Builder.create(this,vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + "Nat-Gateway-EIP" + natIndex)
                                        .vpc(true).provider(provider).build();

                                natGateway = NatGateway.Builder.create(this,vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + "Nat-Gateway" + natIndex)
                                        .allocationId(eip.getId())
                                        .provider(provider)
                                        .subnetId(publicSubnetList.get(l).getId())
                                        .tags(Map.of("Name", awsClouds.get(i).getProjectName() + "-" + vpcs.get(k).getTagName() + "-NGW-" + l))
                                        .build();

                                privateRouteTable = RouteTable.Builder.create(this, vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + "Private-Route-Table" + natIndex)
                                        .provider(provider)
                                        .vpcId(vpcDeployment.getId())
                                        .route(List.of(RouteTableRoute.builder().cidrBlock("0.0.0.0/0")
                                                .gatewayId(natGateway.getId())
                                                .build()))
                                        .tags(Map.of("Name", awsClouds.get(i).getProjectName() + "-" + vpcs.get(k).getTagName() + "-private-rt-" + l))
                                        .build();

                                int routeIndex = 0;

                                for (Nat natElement: nats){

                                    for(com.hashicorp.cdktf.providers.aws.subnet.Subnet publicSubnet: publicSubnetList) {

                                        if(natElement.getPublicSubnetCidr().equals(publicSubnetCidrList.get(publicSubnetList.indexOf(publicSubnet)))) {

                                            for (String privateCidr: natElement.getPrivateSubnet()) {

                                                for (com.hashicorp.cdktf.providers.aws.subnet.Subnet privateSubnet: privateSubnetList) {

                                                    if(privateCidr.equals(privateSubnetCidrList.get(privateSubnetList.indexOf(privateSubnet)))) {

                                                        RouteTableAssociation.Builder.create(this, vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + "Private-Route-Table-Association" + routeIndex)
                                                                .provider(provider)
                                                                .subnetId(privateSubnet.getId())
                                                                .routeTableId(privateRouteTable.getId())
                                                                .build();
                                                        routeIndex ++;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            for (Vpc tempVpc: regions.get(j).getVpcs()) {
                                if (tempVpc.getName().equals(vpcs.get(k).getName())
                                        && tempVpc.getCidr().equals(vpcs.get(k).getCidr())) {

                                    if(!vpcs.get(k).getAlbs().isEmpty()) {

                                        for(int albIndexLoop=0; albIndexLoop<vpcs.get(k).getAlbs().size(); albIndexLoop ++) {

                                            for(Alb tempAlb: albs) {

                                                if (tempAlb.getName().equals(vpcs.get(k).getAlbs().get(albIndexLoop).getName())) {

                                                    List<String> subnetIds = new ArrayList<>();

                                                    try {
                                                        for (String sub: tempAlb.getSubnetIds()) {
                                                            subnetIds.add(publicSubnetMap.get(sub));
                                                        }
                                                    } catch (Exception e) {
                                                        for (String sub: tempAlb.getSubnetIds()) {
                                                            subnetIds.add(privateSubnetMap.get(sub));
                                                        }
                                                    }

                                                    com.hashicorp.cdktf.providers.aws.alb.Alb alb = com.hashicorp.cdktf.providers.aws.alb.Alb.Builder.create(this, tempAlb.getName() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId())
                                                            .name(vpcs.get(k).getTagName() + "-" + tempAlb.getTagName())
                                                            .securityGroups(List.of(albSgMap.get(tempAlb.getName())))
                                                            .internal(false)
                                                            .loadBalancerType("application")
                                                            .subnets(subnetIds)
                                                            .enableCrossZoneLoadBalancing(true)
                                                            .enableDeletionProtection(false)
                                                            .provider(provider)
                                                            .build();

                                                    for (Listener listener: tempAlb.getListeners()) {

                                                        if (listener.getProtocol().equals("HTTP")) {

                                                            if (!listener.getTargetId().isEmpty()) {

                                                                AlbListener tempListener = AlbListener.Builder.create(this, listener.getListenerId() + tempAlb.getName() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + listenerIndex++)
                                                                        .loadBalancerArn(alb.getArn())
                                                                        .port(Integer.parseInt(listener.getPort()))
                                                                        .protocol(listener.getProtocol())
                                                                        .defaultAction(List.of(
                                                                                AlbListenerDefaultAction.builder()
                                                                                        .forward(
                                                                                                AlbListenerDefaultActionForward.builder()
                                                                                                        .targetGroup(List.of(
                                                                                                                AlbListenerDefaultActionForwardTargetGroup.builder()
                                                                                                                        .arn(tgDeploymentArnMap.get(listener.getTargetId()))
                                                                                                                        .build()
                                                                                                        ))
                                                                                                        .build()
                                                                                        )
                                                                                        .type("forward")
                                                                                        .targetGroupArn(tgDeploymentArnMap.get(listener.getTargetId()))
                                                                                        .build()
                                                                        ))
                                                                        .provider(provider)
                                                                        .build();
                                                                listenerMap.put(listener.getListenerId(),tempListener.getArn());
                                                            }

                                                            if (!listener.getRedirect().isEmpty()) {

                                                                String protocol = listener.getRedirect().split(":")[0];
                                                                String port = listener.getRedirect().split(":")[1];
//                                                                String code = listener.getRedirect().split(":")[2];

                                                                AlbListener tempListener = AlbListener.Builder.create(this, listener.getListenerId() + tempAlb.getName() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + listenerIndex++)
                                                                        .loadBalancerArn(alb.getArn())
                                                                        .port(Integer.parseInt(listener.getPort()))
                                                                        .protocol(listener.getProtocol())
                                                                        .defaultAction(List.of(
                                                                                AlbListenerDefaultAction.builder()
                                                                                        .redirect(
                                                                                                AlbListenerDefaultActionRedirect.builder()
                                                                                                        .statusCode("HTTP_301")
                                                                                                        .protocol(protocol)
                                                                                                        .port(port)
                                                                                                        .build()
                                                                                        )
                                                                                        .type("redirect")
                                                                                        .build()
                                                                        ))
                                                                        .provider(provider)
                                                                        .build();
                                                                listenerMap.put(listener.getListenerId(),tempListener.getArn());
                                                            }

                                                            if (!listener.getFixedResponse().isEmpty()) {

                                                                String code = listener.getFixedResponse().split(":")[0];
                                                                String type = listener.getFixedResponse().split(":")[1];
                                                                String msg = listener.getFixedResponse().split(":")[2];

                                                                AlbListener tempListener = AlbListener.Builder.create(this, listener.getListenerId() + tempAlb.getName() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + listenerIndex++)
                                                                        .loadBalancerArn(alb.getArn())
                                                                        .port(Integer.parseInt(listener.getPort()))
                                                                        .protocol(listener.getProtocol())
                                                                        .defaultAction(List.of(
                                                                                AlbListenerDefaultAction.builder()
                                                                                        .fixedResponse(
                                                                                                AlbListenerDefaultActionFixedResponse.builder()
                                                                                                        .statusCode(code)
                                                                                                        .contentType(type)
                                                                                                        .messageBody(msg)
                                                                                                        .build()
                                                                                        )
                                                                                        .type("fixed-response")
                                                                                        .build()
                                                                        ))
                                                                        .provider(provider)
                                                                        .build();
                                                                listenerMap.put(listener.getListenerId(),tempListener.getArn());
                                                            }

                                                        } else {

                                                            if (!listener.getTargetId().isEmpty()) {

                                                                AlbListener tempListener = AlbListener.Builder.create(this, listener.getListenerId() + tempAlb.getName() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + listenerIndex++)
                                                                        .loadBalancerArn(alb.getArn())
                                                                        .port(Integer.parseInt(listener.getPort()))
                                                                        .protocol(listener.getProtocol())
                                                                        .certificateArn(listener.getCertArn())
                                                                        .sslPolicy("ELBSecurityPolicy-TLS13-1-2-2021-06")
                                                                        .defaultAction(List.of(
                                                                                AlbListenerDefaultAction.builder()
                                                                                        .forward(
                                                                                                AlbListenerDefaultActionForward.builder()
                                                                                                        .targetGroup(List.of(
                                                                                                                AlbListenerDefaultActionForwardTargetGroup.builder()
                                                                                                                        .arn(tgDeploymentArnMap.get(listener.getTargetId()))
                                                                                                                        .build()
                                                                                                        ))
                                                                                                        .build()
                                                                                        )
                                                                                        .type("forward")
                                                                                        .targetGroupArn(tgDeploymentArnMap.get(listener.getTargetId()))
                                                                                        .build()
                                                                        ))
                                                                        .provider(provider)
                                                                        .build();
                                                                listenerMap.put(listener.getListenerId(),tempListener.getArn());
                                                            }

                                                            if (!listener.getRedirect().isEmpty()) {

                                                                String protocol = listener.getRedirect().split(":")[0].toUpperCase();
                                                                String port = listener.getRedirect().split(":")[1];
//                                                                String code = listener.getRedirect().split(":")[2];

                                                                AlbListener tempListener = AlbListener.Builder.create(this, listener.getListenerId() + tempAlb.getName() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + listenerIndex++)
                                                                        .loadBalancerArn(alb.getArn())
                                                                        .port(Integer.parseInt(listener.getPort()))
                                                                        .protocol(listener.getProtocol())
                                                                        .certificateArn(listener.getCertArn())
                                                                        .sslPolicy("ELBSecurityPolicy-TLS13-1-2-2021-06")
                                                                        .defaultAction(List.of(
                                                                                AlbListenerDefaultAction.builder()
                                                                                        .redirect(
                                                                                                AlbListenerDefaultActionRedirect.builder()
                                                                                                        .statusCode("HTTP_301")
                                                                                                        .protocol(protocol)
                                                                                                        .port(port)
                                                                                                        .build()
                                                                                        )
                                                                                        .type("redirect")
                                                                                        .build()
                                                                        ))
                                                                        .provider(provider)
                                                                        .build();
                                                                listenerMap.put(listener.getListenerId(),tempListener.getArn());
                                                            }

                                                            if (!listener.getFixedResponse().isEmpty()) {

                                                                String code = listener.getFixedResponse().split(":")[0];
                                                                String type = listener.getFixedResponse().split(":")[1];
                                                                String msg = listener.getFixedResponse().split(":")[2];

                                                                AlbListener tempListener = AlbListener.Builder.create(this, listener.getListenerId() + tempAlb.getName() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + listenerIndex++)
                                                                        .loadBalancerArn(alb.getArn())
                                                                        .port(Integer.parseInt(listener.getPort()))
                                                                        .protocol(listener.getProtocol())
                                                                        .certificateArn(listener.getCertArn())
                                                                        .sslPolicy("ELBSecurityPolicy-TLS13-1-2-2021-06")
                                                                        .defaultAction(List.of(
                                                                                AlbListenerDefaultAction.builder()
                                                                                        .fixedResponse(
                                                                                                AlbListenerDefaultActionFixedResponse.builder()
                                                                                                        .statusCode(code)
                                                                                                        .contentType(type)
                                                                                                        .messageBody(msg)
                                                                                                        .build()
                                                                                        )
                                                                                        .type("fixed-response")
                                                                                        .build()
                                                                        ))
                                                                        .provider(provider)
                                                                        .build();
                                                                listenerMap.put(listener.getListenerId(),tempListener.getArn());
                                                            }

                                                        }

                                                    }

                                                    for (Listener listener: tempAlb.getListeners()) {
                                                        for (ListenerRule listenerRule: tempAlb.getListenerRules()) {
                                                            if (listenerRule.getListenerId().equals(listener.getListenerId())) {

                                                                if (listenerRule.getCondition().equals("host_header") && listenerRule.getAction().equals("forward")){

                                                                    List<AlbListenerRuleAction> listenerRuleActions = new ArrayList<>();

                                                                    for (String targetId: listenerRule.getTargetIds().split(",")){
                                                                        listenerRuleActions.add(
                                                                                AlbListenerRuleAction.builder()
                                                                                        .type("forward")
                                                                                        .targetGroupArn(tgDeploymentArnMap.get(targetId))
                                                                                        .build()
                                                                        );
                                                                    }

                                                                    AlbListenerRule.Builder.create(this, listener.getListenerId() + tempAlb.getName() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + "listenerRule" + listenerRuleIndex++)
                                                                            .condition(List.of(
                                                                                    AlbListenerRuleCondition.builder()
                                                                                            .hostHeader(
                                                                                                    AlbListenerRuleConditionHostHeader.builder()
                                                                                                            .values(List.of(listenerRule.getValue()))
                                                                                                            .build()
                                                                                            )
                                                                                            .build()
                                                                            ))
                                                                            .action(listenerRuleActions)
                                                                            .provider(provider)
                                                                            .listenerArn(listenerMap.get(listenerRule.getListenerId()))
                                                                            .build();
                                                                }

                                                                else if (listenerRule.getCondition().equals("host_header") && listenerRule.getAction().equals("redirect")){

                                                                    String protocol = listenerRule.getRedirect().split(":")[0].toUpperCase();
                                                                    String port = listenerRule.getRedirect().split(":")[1];
//                                                                    String code = listener.getRedirect().split(":")[2];

                                                                    AlbListenerRule.Builder.create(this, listener.getListenerId() + tempAlb.getName() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + "listenerRule" + listenerRuleIndex++)
                                                                            .condition(List.of(
                                                                                    AlbListenerRuleCondition.builder()
                                                                                            .hostHeader(
                                                                                                    AlbListenerRuleConditionHostHeader.builder()
                                                                                                            .values(List.of(listenerRule.getValue()))
                                                                                                            .build()
                                                                                            )
                                                                                            .build()
                                                                            ))
                                                                            .action(List.of(
                                                                                    AlbListenerRuleAction.builder()
                                                                                            .redirect(
                                                                                                    AlbListenerRuleActionRedirect.builder()
                                                                                                            .statusCode("HTTP_301")
                                                                                                            .protocol(protocol)
                                                                                                            .port(port)
                                                                                                            .build()
                                                                                            )
                                                                                            .build()
                                                                            ))
                                                                            .provider(provider)
                                                                            .listenerArn(listenerMap.get(listenerRule.getListenerId()))
                                                                            .build();
                                                                }

                                                                else if (listenerRule.getCondition().equals("host_header") && listenerRule.getAction().equals("fixed-response")){

                                                                    String code = listenerRule.getResponseCode().split(":")[0];
                                                                    String type = listenerRule.getResponseCode().split(":")[1];
                                                                    String msg = listenerRule.getResponseCode().split(":")[2];

                                                                    AlbListenerRule.Builder.create(this, listener.getListenerId() + tempAlb.getName() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + "listenerRule" + listenerRuleIndex++)
                                                                            .condition(List.of(
                                                                                    AlbListenerRuleCondition.builder()
                                                                                            .hostHeader(
                                                                                                    AlbListenerRuleConditionHostHeader.builder()
                                                                                                            .values(List.of(listenerRule.getValue()))
                                                                                                            .build()
                                                                                            )
                                                                                            .build()
                                                                            ))
                                                                            .action(List.of(
                                                                                    AlbListenerRuleAction.builder()
                                                                                            .fixedResponse(
                                                                                                    AlbListenerRuleActionFixedResponse.builder()
                                                                                                            .statusCode(code)
                                                                                                            .contentType(type)
                                                                                                            .messageBody(msg)
                                                                                                            .build()
                                                                                            )
                                                                                            .build()
                                                                            ))
                                                                            .provider(provider)
                                                                            .listenerArn(listenerMap.get(listenerRule.getListenerId()))
                                                                            .build();
                                                                }

                                                                else if (listenerRule.getCondition().equals("path_pattern") && listenerRule.getAction().equals("forward")){

                                                                    List<AlbListenerRuleAction> listenerRuleActions = new ArrayList<>();

                                                                    for (String targetId: listenerRule.getTargetIds().split(",")){
                                                                        listenerRuleActions.add(
                                                                                AlbListenerRuleAction.builder()
                                                                                        .type("forward")
                                                                                        .targetGroupArn(tgDeploymentArnMap.get(targetId))
                                                                                        .build()
                                                                        );
                                                                    }

                                                                    AlbListenerRule.Builder.create(this, listener.getListenerId() + tempAlb.getName() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + "listenerRule" + listenerRuleIndex++)
                                                                            .condition(List.of(
                                                                                    AlbListenerRuleCondition.builder()
                                                                                            .pathPattern(
                                                                                                    AlbListenerRuleConditionPathPattern.builder()
                                                                                                            .values(List.of(listenerRule.getValue()))
                                                                                                            .build()
                                                                                            )
                                                                                            .build()
                                                                            ))
                                                                            .action(listenerRuleActions)
                                                                            .provider(provider)
                                                                            .listenerArn(listenerMap.get(listenerRule.getListenerId()))
                                                                            .build();
                                                                }

                                                                else if (listenerRule.getCondition().equals("path_pattern") && listenerRule.getAction().equals("redirect")){

                                                                    String protocol = listenerRule.getRedirect().split(":")[0].toUpperCase();
                                                                    String port = listenerRule.getRedirect().split(":")[1];
//                                                                    String code = listener.getRedirect().split(":")[2];

                                                                    AlbListenerRule.Builder.create(this, listener.getListenerId() + tempAlb.getName() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + "listenerRule" + listenerRuleIndex++)
                                                                            .condition(List.of(
                                                                                    AlbListenerRuleCondition.builder()
                                                                                            .pathPattern(
                                                                                                    AlbListenerRuleConditionPathPattern.builder()
                                                                                                            .values(List.of(listenerRule.getValue()))
                                                                                                            .build()
                                                                                            )
                                                                                            .build()
                                                                            ))
                                                                            .action(List.of(
                                                                                    AlbListenerRuleAction.builder()
                                                                                            .redirect(
                                                                                                    AlbListenerRuleActionRedirect.builder()
                                                                                                            .statusCode("HTTP_301")
                                                                                                            .protocol(protocol)
                                                                                                            .port(port)
                                                                                                            .build()
                                                                                            )
                                                                                            .build()
                                                                            ))
                                                                            .provider(provider)
                                                                            .listenerArn(listenerMap.get(listenerRule.getListenerId()))
                                                                            .build();
                                                                }

                                                                else if (listenerRule.getCondition().equals("path_pattern") && listenerRule.getAction().equals("fixed-response")){

                                                                    String code = listenerRule.getResponseCode().split(":")[0];
                                                                    String type = listenerRule.getResponseCode().split(":")[1];
                                                                    String msg = listenerRule.getResponseCode().split(":")[2];

                                                                    AlbListenerRule.Builder.create(this, listener.getListenerId() + tempAlb.getName() + vpcs.get(k).getName() + vpcs.get(k).getCidr() + regions.get(j).getRegionName() + regions.get(j).getName() + awsClouds.get(i).getAcId() + "listenerRule" + listenerRuleIndex++)
                                                                            .condition(List.of(
                                                                                    AlbListenerRuleCondition.builder()
                                                                                            .pathPattern(
                                                                                                    AlbListenerRuleConditionPathPattern.builder()
                                                                                                            .values(List.of(listenerRule.getValue()))
                                                                                                            .build()
                                                                                            )
                                                                                            .build()
                                                                            ))
                                                                            .action(List.of(
                                                                                    AlbListenerRuleAction.builder()
                                                                                            .fixedResponse(
                                                                                                    AlbListenerRuleActionFixedResponse.builder()
                                                                                                            .statusCode(code)
                                                                                                            .contentType(type)
                                                                                                            .messageBody(msg)
                                                                                                            .build()
                                                                                            )
                                                                                            .build()
                                                                            ))
                                                                            .provider(provider)
                                                                            .listenerArn(listenerMap.get(listenerRule.getListenerId()))
                                                                            .build();
                                                                }

                                                            }
                                                        }
                                                    }
                                                }

                                            }

                                        }

                                    }

                                }
                            }

                            vpcIndex ++;
                            igwIndex ++;
                            natIndex ++;
                        }
                    }
                }

                regionIndex ++;
            }

        }

    }
}
