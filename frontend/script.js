document.addEventListener('DOMContentLoaded', () => {
  const toolboxContainer = document.getElementById('toolbox-container');
  const awsLink = document.querySelector(".aws-toolbox");
  const openstackLink = document.querySelector(".openstack-toolbox");
  const toolboxItems = document.querySelectorAll('.toolbox-item');
  const drawingArea = document.getElementById('drawingArea');

  awsLink.addEventListener('click', (event) => {
    if (toolboxContainer.classList.contains('open')) {
      event.preventDefault();
      toolboxContainer.classList.remove('open');
      drawingArea.classList.remove('shift-left');
      awsLink.classList.remove('active');
    } else {
      event.preventDefault();
      toolboxContainer.classList.add('open');
      drawingArea.classList.add('shift-left');
      const navLinks = document.querySelectorAll(".nav-link");
      navLinks.forEach(function(link) {
        link.classList.remove("active");
      });
      awsLink.classList.add("active");
    }
  });
  
  let selectedDiagram = null;
  let offsetX = 0;
  let offsetY = 0;
  let isResizing = false;
  let initialMouseX = 0;
  let initialMouseY = 0;
  let initialWidth = 0;
  let initialHeight = 0;
  let contextMenu = null; // Track the active context menu

  toolboxItems.forEach(item => {
    item.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', event.target.textContent);
    });
  });

  drawingArea.addEventListener('dragover', (event) => {
    event.preventDefault();
  });

  drawingArea.addEventListener('drop', (event) => {
    event.preventDefault();
    const diagramText = event.dataTransfer.getData('text/plain');
    const diagramElement = document.createElement('div');
    diagramElement.className = 'diagram';
    diagramElement.contentEditable = true;

    // Set the appropriate class based on the dropped diagram type
    if (diagramText === 'AWS Cloud') {
      diagramElement.classList.add('awscloud');
      diagramElement.dataset.uuid = 'aws-' + generateUUID();
    } else if (diagramText === 'Region') {
      diagramElement.classList.add('region');
      diagramElement.dataset.uuid = 'region-' + generateUUID();
    } else if (diagramText === 'VPC') {
      diagramElement.classList.add('vpc');
      diagramElement.dataset.uuid = 'vpc-' + generateUUID();
    } else if (diagramText === 'IGW') {
      diagramElement.classList.add('igw');
      diagramElement.dataset.uuid = 'igw-' + generateUUID();
    } else if (diagramText === 'NAT') {
      diagramElement.classList.add('nat');
      diagramElement.dataset.uuid = 'nat-' + generateUUID();
    } else if (diagramText === 'Subnet') {
      diagramElement.classList.add('subnet');
      diagramElement.dataset.uuid = 'subnet-' + generateUUID();
    } else if (diagramText === 'Private Subnet') {
      diagramElement.classList.add('privatesubnet');
      diagramElement.dataset.uuid = 'psubnet-' + generateUUID();
    } else if (diagramText === 'EC2') {
      diagramElement.classList.add('ec2');
      diagramElement.dataset.uuid = 'ec2-' + generateUUID();
    } else if (diagramText === 'OpenVPN') {
      diagramElement.classList.add('openvpn');
      diagramElement.dataset.uuid = 'openvpn-' + generateUUID();
    } else if (diagramText === 'SG') {
      diagramElement.classList.add('securitygroup');
      diagramElement.dataset.uuid = 'sg-' + generateUUID();
    } else if (diagramText === 'TG') {
      diagramElement.classList.add('targetgrp');
      diagramElement.dataset.uuid = 'tg-' + generateUUID();
    } else if (diagramText === 'ALB') {
      diagramElement.classList.add('alb');
      diagramElement.dataset.uuid = 'alb-' + generateUUID();
    }

    diagramElement.textContent = diagramText;

    diagramElement.addEventListener('mousedown', (event) => {
      if (!isResizing) {
        selectedDiagram = diagramElement;
        offsetX = event.clientX - selectedDiagram.offsetLeft;
        offsetY = event.clientY - selectedDiagram.offsetTop;
      }
    });

    diagramElement.addEventListener('mousemove', (event) => {
      if (!isResizing && selectedDiagram === diagramElement) {
        const x = event.clientX - offsetX;
        const y = event.clientY - offsetY;
        selectedDiagram.style.left = x + 'px';
        selectedDiagram.style.top = y + 'px';
      }
    });

    diagramElement.addEventListener('mouseup', () => {
      selectedDiagram = null;
    });

    diagramElement.addEventListener('mouseleave', () => {
      selectedDiagram = null;
    });

    diagramElement.addEventListener('mousedown', (event) => {
      initialMouseX = event.clientX;
      initialMouseY = event.clientY;
      initialWidth = diagramElement.offsetWidth;
      initialHeight = diagramElement.offsetHeight;

      if (
        event.target.classList.contains('resize-handle') &&
        selectedDiagram === diagramElement
      ) {
        isResizing = true;
      }
    });

    diagramElement.addEventListener('mousemove', (event) => {
      if (isResizing && selectedDiagram === diagramElement) {
        const width = initialWidth + (event.clientX - initialMouseX);
        const height = initialHeight + (event.clientY - initialMouseY);
        diagramElement.style.width = width + 'px';
        diagramElement.style.height = height + 'px';
      }
    });

    diagramElement.addEventListener('mouseup', () => {
      isResizing = false;
    });

    let protocolsData = [];
    let portsData = [];
    let sourceIpsData = [];
    let albProtocolsData = [];
    let albPortsData = [];
    let albTargetIdsData = [];

    diagramElement.addEventListener('contextmenu', (event) => {
      if (event.button === 2 && diagramElement.classList.contains('awscloud')) {
        event.preventDefault();
        closeContextMenu(); // Close any existing context menu
    
        const diagramElement = event.target;
        const project = diagramElement.dataset.project || 'test';
        const acid = diagramElement.dataset.acid || '162053822661';
        const accesskey = diagramElement.dataset.accesskey || 'AKIASLOZJDDC6JOGORVW';
        const secretkey = diagramElement.dataset.secretkey || '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';
    
        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
    
        const awsCloudUuid = diagramElement.dataset.uuid;
        const awsCloudUuidLabel = document.createElement('label');
        awsCloudUuidLabel.textContent = 'ID: ';
        const awsCloudUuidInput = document.createElement('input');
        awsCloudUuidInput.type = 'text';
        awsCloudUuidInput.className = 'uuid-aws-account';
        awsCloudUuidInput.value = awsCloudUuid;
        awsCloudUuidInput.disabled = true;

        const acidLabel = document.createElement('label');
        acidLabel.textContent = 'Account ID:';
        const acidInput = document.createElement('input');
        acidInput.type = 'text';
        acidInput.className = 'input-aws-account';
        acidInput.value = acid;

        const accessKeyLabel = document.createElement('label');
        accessKeyLabel.textContent = 'Access Key:';
        const accessKeyInput = document.createElement('input');
        accessKeyInput.type = 'text';
        accessKeyInput.className = 'input-aws-accesskey';
        accessKeyInput.value = accesskey;

        const secretKeyLabel = document.createElement('label');
        secretKeyLabel.textContent = 'Secret Access Key:';
        const secretKeyInput = document.createElement('input');
        secretKeyInput.type = 'text';
        secretKeyInput.className = 'input-aws-secretkey';
        secretKeyInput.value = secretkey;

        const projectLabel = document.createElement('label');
        projectLabel.textContent = 'Project/Environment Name:';
        const projectInput = document.createElement('input');
        projectInput.type = 'text';
        projectInput.className = 'input-aws-project';
        projectInput.value = project;

        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
    
        okButton.addEventListener('click', () => {
              diagramElement.dataset.project = projectInput.value;
              diagramElement.dataset.acid = acidInput.value;
              diagramElement.dataset.secretkey = secretKeyInput.value;
              diagramElement.dataset.accesskey = accessKeyInput.value;
              closeContextMenu(); // Close the context menu after clicking OK
          });
    
        contextMenu.appendChild(awsCloudUuidLabel);
        contextMenu.appendChild(awsCloudUuidInput);
        contextMenu.appendChild(acidLabel);
        contextMenu.appendChild(acidInput);
        contextMenu.appendChild(accessKeyLabel);
        contextMenu.appendChild(accessKeyInput);
        contextMenu.appendChild(secretKeyLabel);
        contextMenu.appendChild(secretKeyInput);
        contextMenu.appendChild(projectLabel);
        contextMenu.appendChild(projectInput);
        contextMenu.appendChild(okButton);
    
        document.body.appendChild(contextMenu);
      } else if (event.button === 2 && diagramElement.classList.contains('region')) {
        event.preventDefault();
        closeContextMenu(); // Close any existing context menu
    
        const diagramElement = event.target;
        const regionName = diagramElement.dataset.regionName || 'us-west-1';
    
        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';

        const regionUuid = diagramElement.dataset.uuid;
        const regionUuidLabel = document.createElement('label');
        regionUuidLabel.textContent = 'ID: ';
        const regionUuidInput = document.createElement('input');
        regionUuidInput.type = 'text';
        regionUuidInput.className = 'uuid-aws-region';
        regionUuidInput.value = regionUuid;
        regionUuidInput.disabled = true;
    
        const awsRegionLabel = document.createElement('label');
        awsRegionLabel.textContent = 'AWS Region:';
        const awsRegionInput = document.createElement('input');
        awsRegionInput.type = 'text';
        awsRegionInput.className = 'input-aws-region';
        awsRegionInput.value = regionName;
    
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
    
        okButton.addEventListener('click', () => {
              diagramElement.dataset.regionName = awsRegionInput.value;
              closeContextMenu(); // Close the context menu after clicking OK
          });
    
        contextMenu.appendChild(regionUuidLabel);
        contextMenu.appendChild(regionUuidInput);
        contextMenu.appendChild(awsRegionLabel);
        contextMenu.appendChild(awsRegionInput);
        contextMenu.appendChild(okButton);
    
        document.body.appendChild(contextMenu);
      } else if (event.button === 2 && diagramElement.classList.contains('vpc')) {
        event.preventDefault();
        closeContextMenu(); // Close any existing context menu
    
        const diagramElement = event.target;
    
        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';

        const vpcUuid = diagramElement.dataset.uuid;
        const vpcUuidLabel = document.createElement('label');
        vpcUuidLabel.textContent = 'ID: ';
        const vpcUuidInput = document.createElement('input');
        vpcUuidInput.type = 'text';
        vpcUuidInput.className = 'uuid-aws-vpc';
        vpcUuidInput.value = vpcUuid;
        vpcUuidInput.disabled = true;
    
        const cidrLabel = document.createElement('label');
        cidrLabel.textContent = 'CIDR:';
        const cidrInput = document.createElement('input');
        cidrInput.type = 'text';
        cidrInput.className = 'input-cidr';
        cidrInput.value = diagramElement.dataset.cidr || '10.10.0.0/16';
    
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
    
        okButton.addEventListener('click', () => {
          diagramElement.dataset.cidr = cidrInput.value;
          closeContextMenu(); // Close the context menu after clicking OK
        });
    
        contextMenu.appendChild(vpcUuidLabel);
        contextMenu.appendChild(vpcUuidInput);
        contextMenu.appendChild(cidrLabel);
        contextMenu.appendChild(cidrInput);
        contextMenu.appendChild(okButton);
    
        document.body.appendChild(contextMenu);
      } else if (event.button === 2 && diagramElement.classList.contains('subnet') || event.button === 2 && diagramElement.classList.contains('privatesubnet')) {
        event.preventDefault();
        closeContextMenu(); // Close any existing context menu

        const diagramElement = event.target;
        const availabilityZone = diagramElement.dataset.availabilityZone || 'us-west-1a';
        const subnetCidr = diagramElement.dataset.subnetCidr || '10.10.1.0/24';
    
        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';

        const subnetUuid = diagramElement.dataset.uuid;
        const subnetUuidLabel = document.createElement('label');
        subnetUuidLabel.textContent = 'ID: ';
        const subnetUuidInput = document.createElement('input');
        subnetUuidInput.type = 'text';
        subnetUuidInput.className = 'uuid-aws-subnet';
        subnetUuidInput.value = subnetUuid;
        subnetUuidInput.disabled = true;
    
        const availabilityZoneLabel = document.createElement('label');
        availabilityZoneLabel.textContent = 'Availability Zone:';
        const availabilityZoneInput = document.createElement('input');
        availabilityZoneInput.type = 'text';
        availabilityZoneInput.className = 'input-availability-zone';
        availabilityZoneInput.value = availabilityZone;
    
        const subnetCidrLabel = document.createElement('label');
        subnetCidrLabel.textContent = 'Subnet CIDR:';
        const subnetCidrInput = document.createElement('input');
        subnetCidrInput.type = 'text';
        subnetCidrInput.className = 'input-subnet-cidr';
        subnetCidrInput.value = subnetCidr;
    
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
    
        okButton.addEventListener('click', () => {
            diagramElement.dataset.availabilityZone = availabilityZoneInput.value;
            diagramElement.dataset.subnetCidr = subnetCidrInput.value;
            closeContextMenu(); // Close the context menu after clicking OK
        });
    
        contextMenu.appendChild(subnetUuidLabel);
        contextMenu.appendChild(subnetUuidInput);
        contextMenu.appendChild(availabilityZoneLabel);
        contextMenu.appendChild(availabilityZoneInput);
        contextMenu.appendChild(subnetCidrLabel);
        contextMenu.appendChild(subnetCidrInput);
        contextMenu.appendChild(okButton);
    
        document.body.appendChild(contextMenu);
      } else if (event.button === 2 && diagramElement.classList.contains('nat')) {
        event.preventDefault();
        closeContextMenu(); // Close any existing context menu
    
        const diagramElement = event.target;
        const natSubnet = diagramElement.dataset.natSubnet || '';
    
        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';

        const natUuid = diagramElement.dataset.uuid;
        const natUuidLabel = document.createElement('label');
        natUuidLabel.textContent = 'ID: ';
        const natUuidInput = document.createElement('input');
        natUuidInput.type = 'text';
        natUuidInput.className = 'uuid-aws-nat';
        natUuidInput.value = natUuid;
        natUuidInput.disabled = true;
    
        const natLabel = document.createElement('label');
        natLabel.textContent = 'Private Subnet Cidrs:';
        const natInput = document.createElement('input');
        natInput.type = 'text';
        natInput.className = 'input-nat-subnets';
        natInput.value = natSubnet;
    
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
    
        okButton.addEventListener('click', () => {
              diagramElement.dataset.natSubnet = natInput.value;
              closeContextMenu(); // Close the context menu after clicking OK
          });

        contextMenu.appendChild(natUuidLabel);
        contextMenu.appendChild(natUuidInput);
        contextMenu.appendChild(natLabel);
        contextMenu.appendChild(natInput);
        contextMenu.appendChild(okButton);
    
        document.body.appendChild(contextMenu);
      } else if (event.button === 2 && diagramElement.classList.contains('securitygroup')) {
        event.preventDefault();
        closeContextMenu(); // Close any existing context menu
    
        const diagramElement = event.target;
        let sgRules = diagramElement.sgRules || [];
        const firstRightClick = diagramElement.dataset.firstRightClick || true;
        
        if (firstRightClick === true){
          const openvpnElements = Array.from(document.getElementsByClassName('openvpn'));
          const securityGroupRect = diagramElement.getBoundingClientRect();
        
          for (const openvpnElement of openvpnElements) {
            const openvpnRect = openvpnElement.getBoundingClientRect();
            if (
              openvpnRect.left >= securityGroupRect.left &&
              openvpnRect.top >= securityGroupRect.top &&
              openvpnRect.right <= securityGroupRect.right &&
              openvpnRect.bottom <= securityGroupRect.bottom
            ) {
              diagramElement.dataset.firstRightClick = false;
              protocolsData = ["tcp","tcp","tcp","udp"];
              portsData = ["22","443","943","1194"];
              sourceIpsData = ["0.0.0.0/0","0.0.0.0/0","0.0.0.0/0","0.0.0.0/0"];
            }
          }
        }

        contextMenu = document.createElement('div');
        contextMenu.className = 'right-click-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
        contextMenu.classList.add("show");

        const sgUuid = diagramElement.dataset.uuid;
        const sgUuidLabel = document.createElement('label');
        sgUuidLabel.textContent = 'ID: ';
        const sgUuidInput = document.createElement('input');
        sgUuidInput.type = 'text';
        sgUuidInput.className = 'uuid-aws-sg';
        sgUuidInput.value = sgUuid;
        sgUuidInput.disabled = true;
        contextMenu.appendChild(sgUuidLabel);
        contextMenu.appendChild(sgUuidInput);
        
        const columnsDiv = document.createElement("div");
        columnsDiv.classList.add("columns");
        contextMenu.appendChild(columnsDiv);

        const protocolColumns = document.createElement("div");
        protocolColumns.classList.add("column");
        const protocolLabel = document.createElement("label");
        protocolLabel.textContent = "Protocol";
        protocolColumns.appendChild(protocolLabel);
        columnsDiv.appendChild(protocolColumns);

        const portColumns = document.createElement("div");
        portColumns.classList.add("column");
        const portLabel = document.createElement("label");
        portLabel.textContent = "Port Number";
        portColumns.appendChild(portLabel);
        columnsDiv.appendChild(portColumns);
        
        const sourceIpColumns = document.createElement("div");
        sourceIpColumns.classList.add("column");
        const sourceIpLabel = document.createElement("label");
        sourceIpLabel.textContent = "Source Ips";
        sourceIpColumns.appendChild(sourceIpLabel);
        columnsDiv.appendChild(sourceIpColumns);

        const addButton = document.createElement("button");
        addButton.textContent = "Add Rule";
        addButton.addEventListener("click", addRow);
    
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
    
        okButton.addEventListener('click', () => {
          const protocols = Array.from(document.querySelectorAll(".protocol-input")).map(
            (input) => input.value
          );
          const ports = Array.from(document.querySelectorAll(".port-input")).map(
            (input) => input.value
          );
          const sourceIps = Array.from(document.querySelectorAll(".source-input")).map(
            (input) => input.value
          );
        
          const objectArray = [];
          const newProtocolsData = [];
          const newPortsData = [];
          const newSourceIpsData = [];
          for (let i = 0; i < ports.length; i++) {
            const object = {
              protocol: protocols[i],
              port: ports[i],
              sourceIp: sourceIps[i]
            };
            newProtocolsData.push(object.protocol);
            newPortsData.push(object.port);
            newSourceIpsData.push(object.sourceIp);
            objectArray.push(object);
          }

          protocolsData = newProtocolsData;
          portsData = newPortsData;
          sourceIpsData = newSourceIpsData;
          diagramElement.sgRules = objectArray;
          closeContextMenu(); 
        });
    
        contextMenu.appendChild(addButton);
        contextMenu.appendChild(okButton);
    
        document.body.appendChild(contextMenu);

        for (let i = 0; i < portsData.length; i++) {

          const sgProtocolInput = document.createElement("select");
          sgProtocolInput.className = "protocol-input";
          const sgTcpOption = document.createElement('option');
          sgTcpOption.value = 'tcp';
          sgTcpOption.textContent = 'tcp';
          const sgIcmpOption = document.createElement('option');
          sgIcmpOption.value = 'icmp';
          sgIcmpOption.textContent = 'icmp';
          const sgUdpOption = document.createElement('option');
          sgUdpOption.value = 'udp';
          sgUdpOption.textContent = 'udp';
          sgProtocolInput.appendChild(sgTcpOption);
          sgProtocolInput.appendChild(sgUdpOption);
          sgProtocolInput.appendChild(sgIcmpOption);
          sgProtocolInput.value = getDataByIndex(0, i);
          protocolColumns.appendChild(sgProtocolInput);

          const portInput = document.createElement("input");
          portInput.type = "text";
          portInput.className = "port-input";
          portInput.value = getDataByIndex(1, i);
          portColumns.appendChild(portInput);
      
          const sourceIpInput = document.createElement("input");
          sourceIpInput.type = "text";
          sourceIpInput.className = "source-input";
          sourceIpInput.value = getDataByIndex(2, i);
          sourceIpColumns.appendChild(sourceIpInput);
        }

        function getDataByIndex(index, i) {
          if (index === 0) {
            return protocolsData[i] || "";
          } else if (index === 1) {
            return portsData[i] || "";
          }else if (index === 2) {
            return sourceIpsData[i] || "";
          }
        }
        
        function addRow() {
          const columns = document.querySelectorAll(".column");
          const classNames = ["protocol-input", "port-input", "source-input"];
          
          columns.forEach((column, index) => {
            if(classNames[index] === "protocol-input") {
              const input = document.createElement("select");
              input.className = classNames[index];
              const sgTcpOption = document.createElement('option');
              sgTcpOption.value = 'tcp';
              sgTcpOption.textContent = 'tcp';
              const sgIcmpOption = document.createElement('option');
              sgIcmpOption.value = 'icmp';
              sgIcmpOption.textContent = 'icmp';
              const sgUdpOption = document.createElement('option');
              sgUdpOption.value = 'udp';
              sgUdpOption.textContent = 'udp';
              input.appendChild(sgTcpOption);
              input.appendChild(sgUdpOption);
              input.appendChild(sgIcmpOption);
              column.appendChild(input);
            } else {
              const input = document.createElement("input");
              input.type = "text";
              input.className = classNames[index];
              column.appendChild(input);
            }
            
          });
        }

      } else if (event.button === 2 && diagramElement.classList.contains('ec2')) {
        event.preventDefault();
        closeContextMenu(); // Close any existing context menu

        const diagramElement = event.target;
        const ec2Data = {
          keyPair: diagramElement.dataset.keyPair || 'kafkacali',
          instanceType: diagramElement.dataset.instanceType || 't2.small',
          operatingSystem: diagramElement.dataset.operatingSystem || 'ubuntu',
          operatingSystemVersion: diagramElement.dataset.operatingSystemVersion || '20.04',
          ephemeralStorage: diagramElement.dataset.ephemeralStorage || '30',
          userData: diagramElement.dataset.userData || ''
        };

        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
        contextMenu.style.width = "200px";

        const ec2Uuid = diagramElement.dataset.uuid;
        const ec2UuidLabel = document.createElement('label');
        ec2UuidLabel.textContent = 'ID: ';
        const ec2UuidInput = document.createElement('input');
        ec2UuidInput.type = 'text';
        ec2UuidInput.className = 'uuid-aws-ec2';
        ec2UuidInput.value = ec2Uuid;
        ec2UuidInput.disabled = true;

        const keyPairLabel = document.createElement('label');
        keyPairLabel.textContent = 'Key Pair Name:';
        const keyPairInput = document.createElement('input');
        keyPairInput.type = 'text';
        keyPairInput.className = 'input-key-type';
        keyPairInput.value = ec2Data.keyPair;

        const instanceTypeLabel = document.createElement('label');
        instanceTypeLabel.textContent = 'Instance Type:';
        const instanceTypeInput = document.createElement('input');
        instanceTypeInput.type = 'text';
        instanceTypeInput.className = 'input-instance-type';
        instanceTypeInput.value = ec2Data.instanceType;

        const operatingSystemLabel = document.createElement('label');
        operatingSystemLabel.textContent = 'Operating System:';
        const operatingSystemInput = document.createElement('select');
        operatingSystemInput.className = 'input-operating-system';
        const ubuntuOption = document.createElement('option');
        ubuntuOption.value = 'ubuntu';
        ubuntuOption.textContent = 'Ubuntu';
        const debianOption = document.createElement('option');
        debianOption.value = 'debian';
        debianOption.textContent = 'Debian';
        operatingSystemInput.appendChild(ubuntuOption);
        operatingSystemInput.appendChild(debianOption);
        operatingSystemInput.value = ec2Data.operatingSystem;

        const versionLabel = document.createElement('label');
        versionLabel.textContent = 'OS Version:';
        const versionInput = document.createElement('select');
        versionInput.className = 'input-operating-system-version';
        function updateVersionOptions() {
          while (versionInput.firstChild) {
            versionInput.firstChild.remove();
          }
          const selectedOperatingSystem = operatingSystemInput.value;
          if (selectedOperatingSystem === 'ubuntu') {
            const version2004Option = document.createElement('option');
            version2004Option.value = '20.04';
            version2004Option.textContent = '20.04';

            const version2204Option = document.createElement('option');
            version2204Option.value = '22.04';
            version2204Option.textContent = '22.04';

            versionInput.appendChild(version2004Option);
            versionInput.appendChild(version2204Option);
          } else if (selectedOperatingSystem === 'debian') {
            const version11Option = document.createElement('option');
            version11Option.value = '11';
            version11Option.textContent = '11';

            versionInput.appendChild(version11Option);
          }
        }
        operatingSystemInput.addEventListener('change', updateVersionOptions);
        versionInput.value = ec2Data.operatingSystemVersion;
        updateVersionOptions();

        const ephemeralStorageLabel = document.createElement('label');
        ephemeralStorageLabel.textContent = 'Ephemeral Storage(GB):';
        const ephemeralStorageInput = document.createElement('input');
        ephemeralStorageInput.type = 'text';
        ephemeralStorageInput.className = 'input-ephemeral-storage';
        ephemeralStorageInput.value = ec2Data.ephemeralStorage;

        const userDataLabel = document.createElement('label');
        userDataLabel.textContent = 'User Data: ';
        const userDataInput = document.createElement('textArea');
        userDataInput.type = 'text';
        userDataInput.className = 'input-user-data';
        userDataInput.value = ec2Data.userData;

        const okButton = document.createElement('button');
        okButton.textContent = 'OK';

        okButton.addEventListener('click', () => {
          diagramElement.dataset.instanceType = instanceTypeInput.value;
          diagramElement.dataset.operatingSystem = operatingSystemInput.value;
          diagramElement.dataset.operatingSystemVersion = versionInput.value;
          diagramElement.dataset.keyPair = keyPairInput.value;
          diagramElement.dataset.ephemeralStorage = ephemeralStorageInput.value;
          diagramElement.dataset.userData = userDataInput.value;
          closeContextMenu(); // Close the context menu after clicking OK
        });

        contextMenu.appendChild(ec2UuidLabel);
        contextMenu.appendChild(ec2UuidInput);
        contextMenu.appendChild(instanceTypeLabel);
        contextMenu.appendChild(instanceTypeInput);
        contextMenu.appendChild(operatingSystemLabel);
        contextMenu.appendChild(operatingSystemInput);
        contextMenu.appendChild(versionLabel);
        contextMenu.appendChild(versionInput);
        contextMenu.appendChild(keyPairLabel);
        contextMenu.appendChild(keyPairInput);
        contextMenu.appendChild(ephemeralStorageLabel);
        contextMenu.appendChild(ephemeralStorageInput);
        contextMenu.appendChild(userDataLabel);
        contextMenu.appendChild(userDataInput);
        contextMenu.appendChild(okButton);

        document.body.appendChild(contextMenu);
      } else if (event.button === 2 && diagramElement.classList.contains('openvpn')) {
        event.preventDefault();
        closeContextMenu(); // Close any existing context menu

        const diagramElement = event.target;
        const ec2Data = {
          keyPair: diagramElement.dataset.keyPair || 'kafkacali',
          instanceType: diagramElement.dataset.instanceType || 't2.small',
          ephemeralStorage: diagramElement.dataset.ephemeralStorage || '20',
          userCount: diagramElement.dataset.userCount || '5',
          vpnUsername: diagramElement.dataset.vpnUsername || '',
          vpnPasswd: diagramElement.dataset.vpnPasswd || ''
        };

        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
        contextMenu.style.width = "200px";

        const ec2Uuid = diagramElement.dataset.uuid;
        const ec2UuidLabel = document.createElement('label');
        ec2UuidLabel.textContent = 'ID: ';
        const ec2UuidInput = document.createElement('input');
        ec2UuidInput.type = 'text';
        ec2UuidInput.className = 'uuid-aws-ec2';
        ec2UuidInput.value = ec2Uuid;
        ec2UuidInput.disabled = true;

        const keyPairLabel = document.createElement('label');
        keyPairLabel.textContent = 'Key Pair Name:';
        const keyPairInput = document.createElement('input');
        keyPairInput.type = 'text';
        keyPairInput.className = 'input-key-type';
        keyPairInput.value = ec2Data.keyPair;

        const instanceTypeLabel = document.createElement('label');
        instanceTypeLabel.textContent = 'Instance Type:';
        const instanceTypeInput = document.createElement('input');
        instanceTypeInput.type = 'text';
        instanceTypeInput.className = 'input-instance-type';
        instanceTypeInput.value = ec2Data.instanceType;

        const userCountLabel = document.createElement('label');
        userCountLabel.textContent = 'User Count:';
        const userCountInput = document.createElement('select');
        userCountInput.className = 'input-openvpn-user-count';
        const Count5Option = document.createElement('option');
        Count5Option.value = '5';
        Count5Option.textContent = '5';
        const Count10Option = document.createElement('option');
        Count10Option.value = '10';
        Count10Option.textContent = '10';
        const Count25Option = document.createElement('option');
        Count25Option.value = '25';
        Count25Option.textContent = '25';
        userCountInput.appendChild(Count5Option);
        userCountInput.appendChild(Count10Option);
        userCountInput.appendChild(Count25Option);
        userCountInput.value = ec2Data.userCount;

        const ephemeralStorageLabel = document.createElement('label');
        ephemeralStorageLabel.textContent = 'Ephemeral Storage(GB):';
        const ephemeralStorageInput = document.createElement('input');
        ephemeralStorageInput.type = 'text';
        ephemeralStorageInput.className = 'input-ephemeral-storage';
        ephemeralStorageInput.value = ec2Data.ephemeralStorage;

        const vpnUsernameLabel = document.createElement('label');
        vpnUsernameLabel.textContent = 'Username:';
        const vpnUsernameInput = document.createElement('input');
        vpnUsernameInput.type = 'text';
        vpnUsernameInput.className = 'input-vpn-user';
        vpnUsernameInput.value = ec2Data.vpnUsername;

        const vpnPasswordLabel = document.createElement('label');
        vpnPasswordLabel.textContent = 'Password:';
        const vpnPasswordInput = document.createElement('input');
        vpnPasswordInput.type = 'text';
        vpnPasswordInput.className = 'input-vpn-pass';
        vpnPasswordInput.value = ec2Data.vpnPasswd;

        const okButton = document.createElement('button');
        okButton.textContent = 'OK';

        okButton.addEventListener('click', () => {
          diagramElement.dataset.instanceType = instanceTypeInput.value;
          diagramElement.dataset.userCount = userCountInput.value;
          diagramElement.dataset.keyPair = keyPairInput.value;
          diagramElement.dataset.ephemeralStorage = ephemeralStorageInput.value;
          diagramElement.dataset.vpnUsername = vpnUsernameInput.value;
          diagramElement.dataset.vpnPasswd = vpnPasswordInput.value;
          closeContextMenu();
        });

        contextMenu.appendChild(ec2UuidLabel);
        contextMenu.appendChild(ec2UuidInput);
        contextMenu.appendChild(instanceTypeLabel);
        contextMenu.appendChild(instanceTypeInput);
        contextMenu.appendChild(userCountLabel);
        contextMenu.appendChild(userCountInput);
        contextMenu.appendChild(keyPairLabel);
        contextMenu.appendChild(keyPairInput);
        contextMenu.appendChild(ephemeralStorageLabel);
        contextMenu.appendChild(ephemeralStorageInput);
        contextMenu.appendChild(vpnUsernameLabel);
        contextMenu.appendChild(vpnUsernameInput);
        contextMenu.appendChild(vpnPasswordLabel);
        contextMenu.appendChild(vpnPasswordInput);
        contextMenu.appendChild(okButton);

        document.body.appendChild(contextMenu);
      } else if (event.button === 2 && diagramElement.classList.contains('targetgrp')) {
        event.preventDefault();
        closeContextMenu(); // Close any existing context menu
    
        const diagramElement = event.target;
        let tgInstances = diagramElement.tgInstances || [];
        const tgName = diagramElement.dataset.tgName || 'TG1';
        const tgProtocol = diagramElement.dataset.tgProtocol || '';
        const tgPort = diagramElement.dataset.tgPort || '';
        const tgProtocolVer = diagramElement.dataset.tgProtocolVer || '';
    
        contextMenu = document.createElement('div');
        contextMenu.className = 'right-click-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
        contextMenu.classList.add("show");

        const tgUuid = diagramElement.dataset.uuid;
        const tgUuidLabel = document.createElement('label');
        tgUuidLabel.textContent = 'ID: ';
        const tgUuidInput = document.createElement('input');
        tgUuidInput.type = 'text';
        tgUuidInput.className = 'uuid-aws-tg';
        tgUuidInput.value = tgUuid;
        tgUuidInput.disabled = true;

        const tgNameLabel = document.createElement('label');
        tgNameLabel.textContent = 'Target Group Name: ';
        const tgNameInput = document.createElement('input');
        tgNameInput.type = 'text';
        tgNameInput.className = 'input-tg-name';
        tgNameInput.value = tgName;

        const tgProtocolLabel = document.createElement('label');
        tgProtocolLabel.textContent = 'Protocol: ';
        const tgProtocolInput = document.createElement('select');
        tgProtocolInput.className = 'input-tg-protocol';
        const httpOption = document.createElement('option');
        httpOption.value = 'HTTP';
        httpOption.textContent = 'HTTP';
        const httpsOption = document.createElement('option');
        httpsOption.value = 'HTTPS';
        httpsOption.textContent = 'HTTPS';
        const tcpOption = document.createElement('option');
        tcpOption.value = 'TCP';
        tcpOption.textContent = 'TCP';
        tgProtocolInput.appendChild(httpOption);
        tgProtocolInput.appendChild(httpsOption);
        tgProtocolInput.appendChild(tcpOption);
        tgProtocolInput.value = tgProtocol;
        tgProtocolInput.addEventListener('change', handleProtocolChange);

        const tgPortLabel = document.createElement('label');
        tgPortLabel.textContent = 'Port: ';
        const tgPortInput = document.createElement('input');
        tgPortInput.type = 'text';
        tgPortInput.className = 'input-tg-port';
        tgPortInput.value = tgPort;

        const tgProtocolVersionLabel = document.createElement('label');
        tgProtocolVersionLabel.textContent = 'Protocol Version: ';
        const tgProtocolVersionInput = document.createElement('select');
        tgProtocolVersionInput.className = 'input-tg-protocol-version';
        const http1Option = document.createElement('option');
        http1Option.value = 'HTTP1';
        http1Option.textContent = 'HTTP1';
        const http2Option = document.createElement('option');
        http2Option.value = 'HTTP2';
        http2Option.textContent = 'HTTP2';
        const grpcOption = document.createElement('option');
        grpcOption.value = 'gRPC';
        grpcOption.textContent = 'gRPC';
        tgProtocolVersionInput.appendChild(http1Option);
        tgProtocolVersionInput.appendChild(http2Option);
        tgProtocolVersionInput.appendChild(grpcOption);
        tgProtocolVersionInput.value = tgProtocolVer;

        if (tgProtocolInput.value === 'HTTP' || tgProtocolInput.value === 'HTTPS') {
          tgProtocolVersionLabel.style.display = 'block';
          tgProtocolVersionInput.style.display = 'block';
        } else {
          tgProtocolVersionLabel.style.display = 'none';
          tgProtocolVersionInput.style.display = 'none';
        }

        const okButton = document.createElement('button');
        okButton.textContent = 'OK';

        contextMenu.appendChild(tgUuidLabel);
        contextMenu.appendChild(tgUuidInput);
        contextMenu.appendChild(tgNameLabel);
        contextMenu.appendChild(tgNameInput);
        contextMenu.appendChild(tgProtocolLabel);
        contextMenu.appendChild(tgProtocolInput);
        contextMenu.appendChild(tgProtocolVersionLabel);
        contextMenu.appendChild(tgProtocolVersionInput);
        contextMenu.appendChild(tgPortLabel);
        contextMenu.appendChild(tgPortInput);
        contextMenu.appendChild(okButton);
        document.body.appendChild(contextMenu);
    
        okButton.addEventListener('click', () => {
          diagramElement.dataset.tgName = tgNameInput.value;
          diagramElement.dataset.tgProtocol = tgProtocolInput.value;
          diagramElement.dataset.tgPort = tgPortInput.value;
          diagramElement.dataset.tgProtocolVer = tgProtocolVersionInput.value;
          closeContextMenu(); 
        });

        function handleProtocolChange() {
          const selectedProtocol = tgProtocolInput.value;
        
          if (selectedProtocol === 'HTTP' || selectedProtocol === 'HTTPS') {
            tgProtocolVersionInput.value = 'HTTP1';
            tgProtocolVersionLabel.style.display = 'block';
            tgProtocolVersionInput.style.display = 'block';
          } else {
            tgProtocolVersionInput.value = '';
            tgProtocolVersionLabel.style.display = 'none';
            tgProtocolVersionInput.style.display = 'none';
          }
        }
      } else if (event.button === 2 && diagramElement.classList.contains('alb')) {
        event.preventDefault();
        closeContextMenu(); // Close any existing context menu
    
        const diagramElement = event.target;
        let listeners = diagramElement.listeners || [];
        const albName = diagramElement.dataset.albName || 'ALB1';
        const albSubnetIds = diagramElement.dataset.albSubnetIds || '';
    
        contextMenu = document.createElement('div');
        contextMenu.className = 'right-click-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
        contextMenu.classList.add("show");

        const albUuid = diagramElement.dataset.uuid;
        const albUuidLabel = document.createElement('label');
        albUuidLabel.textContent = 'ID: ';
        const albUuidInput = document.createElement('input');
        albUuidInput.type = 'text';
        albUuidInput.className = 'uuid-aws-alb';
        albUuidInput.value = albUuid;
        albUuidInput.disabled = true;

        const albNameLabel = document.createElement('label');
        albNameLabel.textContent = 'ALB Name: ';
        const albNameInput = document.createElement('input');
        albNameInput.type = 'text';
        albNameInput.className = 'input-alb-name';
        albNameInput.value = albName;

        const albSubnetIdLabel = document.createElement('label');
        albSubnetIdLabel.textContent = 'Subnet IDs: ';
        const albSubnetIdInput = document.createElement('input');
        albSubnetIdInput.type = 'text';
        albSubnetIdInput.className = 'input-alb-subnets';
        albSubnetIdInput.value = albSubnetIds;

        const listenerLabel = document.createElement('label');
        listenerLabel.textContent = 'Listeners: ';

        contextMenu.appendChild(albUuidLabel);
        contextMenu.appendChild(albUuidInput);
        contextMenu.appendChild(albNameLabel);
        contextMenu.appendChild(albNameInput);
        contextMenu.appendChild(albSubnetIdLabel);
        contextMenu.appendChild(albSubnetIdInput);
        contextMenu.appendChild(listenerLabel);
        
        const AlbColumnsDiv = document.createElement("div");
        AlbColumnsDiv.classList.add("columns");
        contextMenu.appendChild(AlbColumnsDiv);

        const protocolColumns = document.createElement("div");
        protocolColumns.classList.add("column");
        const protocolLabel = document.createElement("label");
        protocolLabel.textContent = "Protocol";
        protocolLabel.style.color = "#505050";
        protocolColumns.appendChild(protocolLabel);
        AlbColumnsDiv.appendChild(protocolColumns);

        const portColumns = document.createElement("div");
        portColumns.classList.add("column");
        const portLabel = document.createElement("label");
        portLabel.textContent = "Port Number";
        portLabel.style.color = "#505050";
        portColumns.appendChild(portLabel);
        AlbColumnsDiv.appendChild(portColumns);
        
        const targetIdColumns = document.createElement("div");
        targetIdColumns.classList.add("column");
        const targetIdLabel = document.createElement("label");
        targetIdLabel.textContent = "Target Id";
        targetIdLabel.style.color = "#505050";
        targetIdColumns.appendChild(targetIdLabel);
        AlbColumnsDiv.appendChild(targetIdColumns);

        const addButton = document.createElement("button");
        addButton.textContent = "Add Rule";
        addButton.addEventListener("click", addRow);
    
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
    
        okButton.addEventListener('click', () => {
          diagramElement.dataset.albName = albNameInput.value;
          diagramElement.dataset.albSubnetIds = albSubnetIdInput.value;

          const albProtocols = Array.from(document.querySelectorAll(".alb-protocol-input")).map(
            (input) => input.value
          );
          const albPorts = Array.from(document.querySelectorAll(".alb-port-input")).map(
            (input) => input.value
          );
          const albTargetIds = Array.from(document.querySelectorAll(".alb-target-id-input")).map(
            (input) => input.value
          );
        
          const objectArray = [];
          const newProtocolsData = [];
          const newPortsData = [];
          const newTargetIdsData = [];
          for (let i = 0; i < albPorts.length; i++) {
            const object = {
              protocol: albProtocols[i],
              port: albPorts[i],
              targetId: albTargetIds[i]
            };
            newProtocolsData.push(object.protocol)
            newPortsData.push(object.port)
            newTargetIdsData.push(object.targetId)
            objectArray.push(object);
          }

          albProtocolsData = newProtocolsData;
          albPortsData = newPortsData;
          albTargetIdsData = newTargetIdsData;
          diagramElement.listeners = objectArray;
          closeContextMenu(); 
        });
    
        contextMenu.appendChild(addButton);
        contextMenu.appendChild(okButton);
    
        document.body.appendChild(contextMenu);

        for (let i = 0; i < albPortsData.length; i++) {

          const protocolInput = document.createElement("select");
          protocolInput.className = "alb-protocol-input";
          const albHttpOption = document.createElement('option');
          albHttpOption.value = 'HTTP';
          albHttpOption.textContent = 'HTTP';
          const albHttpsOption = document.createElement('option');
          albHttpsOption.value = 'HTTPS';
          albHttpsOption.textContent = 'HTTPS';
          protocolInput.appendChild(albHttpOption);
          protocolInput.appendChild(albHttpsOption);
          protocolInput.value = getDataByIndex(0, i);
          protocolColumns.appendChild(protocolInput);

          const portInput = document.createElement("input");
          portInput.type = "text";
          portInput.className = "alb-port-input";
          portInput.value = getDataByIndex(1, i);
          portColumns.appendChild(portInput);
      
          const targetIdInput = document.createElement("input");
          targetIdInput.type = "text";
          targetIdInput.className = "alb-target-id-input";
          targetIdInput.value = getDataByIndex(2, i);
          targetIdColumns.appendChild(targetIdInput);
        }

        function getDataByIndex(index, i) {
          if (index === 0) {
            return albProtocolsData[i] || "";
          } else if (index === 1) {
            return albPortsData[i] || "";
          } else if (index === 2) {
            return albTargetIdsData[i] || "";
          }
        }
        
        function addRow() {
          const columns = document.querySelectorAll(".column");
          const classNames = ["alb-protocol-input", "alb-port-input", "alb-target-id-input"];
          
          columns.forEach((column, index) => {
            if (classNames[index] === "alb-protocol-input") {
              const input = document.createElement("select");
              input.className = classNames[index];
              const albHttpOption = document.createElement('option');
              albHttpOption.value = 'HTTP';
              albHttpOption.textContent = 'HTTP';
              const albHttpsOption = document.createElement('option');
              albHttpsOption.value = 'HTTPS';
              albHttpsOption.textContent = 'HTTPS';
              input.appendChild(albHttpOption);
              input.appendChild(albHttpsOption);
              column.appendChild(input);
            } else {
              const input = document.createElement("input");
              input.type = "text";
              input.className = classNames[index];
              column.appendChild(input);
            }
          });
        }

      }
    });
    drawingArea.appendChild(diagramElement);
  });

  const trackButton = document.getElementById('trackButton');
  trackButton.addEventListener('click', () => {
    const hierarchy = generateHierarchy(drawingArea);
    const json = JSON.stringify(hierarchy, null, 2);
    console.log(json);
    const url = 'http://54.176.126.43:8080/arc';

    trackButton.disabled = true;
    trackButton.textContent = 'Deploying...';

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: json
    })
      .then(response => response.json())
      .then(result => {
        console.log('Response:', result);
        trackButton.disabled = false;
        trackButton.textContent = 'Deploy';
      })
      .catch(error => {
        console.error('Error:', error);
        trackButton.disabled = false;
        trackButton.textContent = 'Deploy';
      });
    
  });

  const destroyButton = document.getElementById('destroyButton');
  destroyButton.addEventListener('click', () => {
    const hierarchy = generateHierarchy(drawingArea);
    const json = JSON.stringify(hierarchy, null, 2);
    console.log(json);
    const url = 'http://54.176.126.43:8080/arc';

    destroyButton.disabled = true;
    destroyButton.textContent = 'Destroying...';

    fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: json
    })
      .then(response => response.json())
      .then(result => {
        console.log('Response:', result);
        destroyButton.disabled = false;
        destroyButton.textContent = 'Destroy';
      })
      .catch(error => {
        console.error('Error:', error);
        destroyButton.disabled = false;
        destroyButton.textContent = 'Destroy';
      });
    
  });

  function generateHierarchy(element) {
    const children = Array.from(element.childNodes).filter(child => child.nodeType === Node.ELEMENT_NODE);
    const arc = document.getElementById('arcNameInput').value;;
    const aws = [];
    const regions = [];
    const vpcs = [];
    const subnets = [];
    const nats = [];
    const sgs = [];
    const tgs = [];
    const albs = [];
    const instances = [];
    const openvpns = [];
  
    children.forEach(child => {
      const name = child.dataset.uuid;
      const tagName = child.textContent.trim();
      const type = child.classList.contains('ec2') ? 'EC2' : child.classList.contains('openvpn') ? 'OpenVPN' : child.classList.contains('subnet') ? 'Subnet' : child.classList.contains('privatesubnet') ? 'PrivateSubnet' : child.classList.contains('vpc') ? 'VPC' : child.classList.contains('region') ? 'Region' : child.classList.contains('awscloud') ? 'AWS' : child.classList.contains('nat') ? 'Nat' : child.classList.contains('securitygroup') ? 'SG' : child.classList.contains('targetgrp') ? 'TG' : child.classList.contains('alb') ? 'ALB' : null;
      const { left, top, width, height } = child.getBoundingClientRect();

      if (type === 'EC2') {
        const keyPair = child.dataset.keyPair || '';
        const instanceType = child.dataset.instanceType || '';
        const operatingSystem = child.dataset.operatingSystem || '';
        const operatingSystemVersion = child.dataset.operatingSystemVersion || '';
        const ephemeralStorage = child.dataset.ephemeralStorage || '';
        const userData = child.dataset.userData || '';
  
        instances.push({
          name,
          tagName,
          type,
          instanceType,
          operatingSystem,
          operatingSystemVersion,
          keyPair,
          ephemeralStorage,
          userData
        });
      }

      if (type === 'OpenVPN') {
        const keyPair = child.dataset.keyPair || '';
        const instanceType = child.dataset.instanceType || '';
        const userCount = child.dataset.userCount || '';
        const ephemeralStorage = child.dataset.ephemeralStorage || '';
        const vpnUsername = child.dataset.vpnUsername || '';
        const vpnPasswd = child.dataset.vpnPasswd || '';
  
        openvpns.push({
          name,
          tagName,
          type,
          instanceType,
          userCount,
          keyPair,
          ephemeralStorage,
          vpnUsername,
          vpnPasswd
        });
      }

      if (type === 'SG') {
        const sgRules = child.sgRules || [];
        const instances = children
          .filter(c => c.classList.contains('ec2'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(ec2 => ({
            name: ec2.dataset.uuid,
            tagName: ec2.textContent.trim(),
            type: 'EC2',
            instanceType: ec2.dataset.instanceType || '',
            operatingSystem: ec2.dataset.operatingSystem || '',
            operatingSystemVersion: ec2.dataset.operatingSystemVersion || '',
            keyPair: ec2.dataset.keyPair || '',
            ephemeralStorage: ec2.dataset.ephemeralStorage || '',
            userData: ec2.dataset.userData || ''
          }));

          const openvpns = children
          .filter(c => c.classList.contains('openvpn'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(vpn => ({
            name: vpn.dataset.uuid,
            tagName: vpn.textContent.trim(),
            type: 'OpenVPN',
            instanceType: vpn.dataset.instanceType || '',
            userCount: vpn.dataset.userCount || '',
            keyPair: vpn.dataset.keyPair || '',
            ephemeralStorage: vpn.dataset.ephemeralStorage || '',
            vpnUsername: vpn.dataset.vpnUsername || '',
            vpnPasswd: vpn.dataset.vpnPasswd || ''
          }));

        const albs = children
        .filter(c => c.classList.contains('alb'))
        .filter(c => {
          const { left: childLeft, top: childTop } = c.getBoundingClientRect();
          return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
            childTop >= top && childTop + c.offsetHeight <= top + height;
        })
        .map(alb => ({
          name: alb.dataset.uuid,
          tagName: alb.textContent.trim(),
          type: 'ALB',
          subnetIds: alb.dataset.albSubnetIds.split(',') || [],
          listeners: alb.listeners || []
        }));
  
        const securityGroup = {
          name,
          tagName,
          type,
          sgRules,
          instances,
          openvpns,
          albs
        };
  
        sgs.push(securityGroup);
      }

      if (type === 'TG') {
        const protocol = child.dataset.tgProtocol || '';
        const port = child.dataset.tgPort || '';
        const protocolVer = child.dataset.tgProtocolVer || '';

        const instances = children
          .filter(c => c.classList.contains('ec2'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(ec2 => ({
            name: ec2.dataset.uuid,
            tagName: ec2.textContent.trim(),
            type: 'EC2',
            instanceType: ec2.dataset.instanceType || '',
            operatingSystem: ec2.dataset.operatingSystem || '',
            operatingSystemVersion: ec2.dataset.operatingSystemVersion || '',
            keyPair: ec2.dataset.keyPair || '',
            ephemeralStorage: ec2.dataset.ephemeralStorage || '',
            userData: ec2.dataset.userData || ''
          }));
  
        const targetGroup = {
          name,
          tagName,
          type,
          protocol,
          protocolVer,
          port,
          instances
        };
  
        tgs.push(targetGroup);
      }

      if (type === 'ALB') {
        const listeners = child.listeners || [];
        const subnetIds = child.dataset.albSubnetIds.split(',') || [];
  
        const alb = {
          name,
          tagName,
          type,
          subnetIds,
          listeners
        };
  
        albs.push(alb);
      }
  
      if (type === 'Subnet') {
        const availabilityZone = child.dataset.availabilityZone || '';
        const subnetCidr = child.dataset.subnetCidr || '';
        let nat = false;
  
        const subnet = {
          name,
          tagName,
          type,
          availabilityZone,
          subnetCidr,
          nat,
          instances: [],
          openvpns: []
        };

        if (children
          .filter(c => c.classList.contains('nat'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          }).length > 0){
            
            subnet.nat = true;
            const subnetNat = children
            .filter(c => c.classList.contains('nat'))
            .filter(c => {
              const { left: childLeft, top: childTop } = c.getBoundingClientRect();
              return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
                childTop >= top && childTop + c.offsetHeight <= top + height;
            }).map(natele => ({
              name: natele.dataset.uuid,
              publicSubnetCidr: subnetCidr,
              privateSubnet: natele.dataset.natSubnet.split(',') || [],
            }));
            nats.push(subnetNat[0]);
          }
        
        const subnetInstances = children
          .filter(c => c.classList.contains('ec2'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(ec2 => ({
            name: ec2.dataset.uuid,
            tagName: ec2.textContent.trim(),
            type: 'EC2',
            instanceType: ec2.dataset.instanceType || '',
            operatingSystem: ec2.dataset.operatingSystem || '',
            operatingSystemVersion: ec2.dataset.operatingSystemVersion || '',
            keyPair: ec2.dataset.keyPair || '',
            ephemeralStorage: ec2.dataset.ephemeralStorage || '',
            userData: ec2.dataset.userData || ''
          }));

        const subnetOpenvpns = children
        .filter(c => c.classList.contains('openvpn'))
        .filter(c => {
          const { left: childLeft, top: childTop } = c.getBoundingClientRect();
          return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
            childTop >= top && childTop + c.offsetHeight <= top + height;
        })
        .map(vpn => ({
          name: vpn.dataset.uuid,
          tagName: vpn.textContent.trim(),
          type: 'OpenVPN',
          instanceType: vpn.dataset.instanceType || '',
          userCount: vpn.dataset.userCount || '',
          keyPair: vpn.dataset.keyPair || '',
          ephemeralStorage: vpn.dataset.ephemeralStorage || '',
          vpnUsername: vpn.dataset.vpnUsername || '',
          vpnPasswd: vpn.dataset.vpnPasswd || ''
        }));
  
        subnet.openvpns.push(...subnetOpenvpns);
        subnet.instances.push(...subnetInstances);
        subnets.push(subnet);
      }

      if (type === 'PrivateSubnet') {
        const availabilityZone = child.dataset.availabilityZone || '';
        const subnetCidr = child.dataset.subnetCidr || '';
        const nat = false;

        const subnet = {
          name,
          tagName,
          type,
          availabilityZone,
          subnetCidr,
          nat,
          instances: [],
          openvpns: []
        };
  
        const subnetInstances = children
          .filter(c => c.classList.contains('ec2'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(ec2 => ({
            name: ec2.dataset.uuid,
            tagName: ec2.textContent.trim(),
            type: 'EC2',
            instanceType: ec2.dataset.instanceType || '',
            operatingSystem: ec2.dataset.operatingSystem || '',
            operatingSystemVersion: ec2.dataset.operatingSystemVersion || '',
            keyPair: ec2.dataset.keyPair || '',
            ephemeralStorage: ec2.dataset.ephemeralStorage || '',
            userData: ec2.dataset.userData || ''
          }));
  
        subnet.instances.push(...subnetInstances);
        subnets.push(subnet);
      }

      if (type === 'VPC') {
        const cidr = child.dataset.cidr || '';
        const sgRules = child.sgRules || [];
        let igw = false

        const vpc = {
          name,
          tagName,
          type,
          cidr,
          igw,
          subnets: [],
          sgs: [],
          tgs: [],
          albs: []
        };

        children.filter(c => c.classList.contains('igw'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          }).length > 0 ? vpc.igw=true: vpc.igw=false;

        const vpcSubnets = children
          .filter(c => c.classList.contains('subnet') || c.classList.contains('privatesubnet'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(subnet => ({
            name: subnet.dataset.uuid,
            tagName: subnet.textContent.trim(),
            type: subnet.classList.contains('privatesubnet') ? 'PrivateSubnet' : 'Subnet',
            availabilityZone: subnet.dataset.availabilityZone || '',
            subnetCidr: subnet.dataset.subnetCidr || '',
            nat: null,
            instances: [],
            openvpns: []
          }));

        const vpcsgs = children
          .filter(c => c.classList.contains('securitygroup'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(sg => ({
            name: sg.dataset.uuid,
            tagName: sg.textContent.trim(),
            type: 'SG',
            sgRules: sg.sgRules || [],
            instances: [],
            openvpns: [],
            albs: []
          }));

          const vpctgs = children
          .filter(c => c.classList.contains('targetgrp'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(tg => ({
            name: tg.dataset.uuid,
            tagName: tg.textContent.trim(),
            type: 'TG',
            protocol: tg.dataset.tgProtocol || '',
            protocolVer: tg.dataset.tgProtocolVer || '',
            port: tg.dataset.tgPort || '',
            instances: []
          }));

          const vpcalbs = children
          .filter(c => c.classList.contains('alb'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(alb => ({
            name: alb.dataset.uuid,
            tagName: alb.textContent.trim(),
            type: 'ALB',
            subnetIds: alb.dataset.albSubnetIds.split(',') || [],
            listeners: alb.listeners || []
          }));

        vpc.subnets.push(...vpcSubnets);
        vpc.sgs.push(...vpcsgs);
        vpc.tgs.push(...vpctgs);
        vpc.albs.push(...vpcalbs);
        vpcs.push(vpc);
      }
  
      if (type === 'Region') {
        const regionName = child.dataset.regionName || '';
  
        const regionObj = {
          name,
          tagName,
          tagName,
          type,
          regionName,
          vpcs: []
        };
  
        const regionVpcs = children
          .filter(c => c.classList.contains('vpc'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(vpc => ({
            name: vpc.dataset.uuid,
            tagName: vpc.textContent.trim(),
            type: 'VPC',
            cidr: vpc.dataset.cidr || '',
            igw: null,
            subnets: []
          }));
  
        regionObj.vpcs.push(...regionVpcs);
        regions.push(regionObj);
      }

      if (type === 'AWS') {
        acId = child.dataset.acid || '';
        accessKey = child.dataset.accesskey || '';
        secretKey = child.dataset.secretkey || '';
        projectName = child.dataset.project || '';
  
        const awsObj = {
          acId,
          accessKey,
          secretKey,
          projectName,
          regions: []
        };
  
        const awsRegions = children
          .filter(c => c.classList.contains('region'))
          .filter(c => {
            const { left: childLeft, top: childTop } = c.getBoundingClientRect();
            return childLeft >= left && childLeft + c.offsetWidth <= left + width &&
              childTop >= top && childTop + c.offsetHeight <= top + height;
          })
          .map(region => ({
            name: region.dataset.uuid,
            tagName: region.textContent.trim(),
            type: 'Region',
            regionName: region.dataset.regionName || '',
            vpcs: []
          }));
  
        awsObj.regions.push(...awsRegions);
        aws.push(awsObj);

      }
    });
  
    return {
      arc,
      aws,
      regions,
      vpcs,
      subnets,
      nats,
      sgs,
      tgs,
      albs,
      instances,
      openvpns
    };
  }

  function closeContextMenu() {
    if (contextMenu) {
      contextMenu.remove();
      contextMenu = null;
    }
  }

  function generateUUID() {
    const array = new Uint8Array(10);
    window.crypto.getRandomValues(array);
    const base64 = btoa(String.fromCharCode.apply(null, array));
    return base64.replace(/[\+/=]/g, '');
  }
});
