function convert() {
  const fileInput = document.getElementById("jsonFile");
  const status = document.getElementById("status");
  const downloadLink = document.getElementById("downloadLink");
  const result = document.getElementById("result");
  const orderWA = document.getElementById("orderWA");
  const lieroM8Plugin = document.getElementById("lieroM8Plugin");
  const warningElement = document.getElementById("warning");
  const signedHack = document.getElementById("signedHack");

  if (!fileInput.files[0]) {
    status.textContent = "Please select a file";
    return;
  }

  const fileReader = new FileReader();
  fileReader.onload = function () {
    try {      
      const data = JSON5.parse(fileReader.result);
      const lwpString = convertToJsonString(data, orderWA.checked);
      const blob = new Blob([lwpString], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      result.textContent = lwpString;
      downloadLink.href = url;
      downloadLink.download = "converted.lwp";
      downloadLink.style.display = "block";
      if (data.weapons.length != 40 || data.wObjects.length != 40 || data.nObjects.length != 24 || data.sObjects.length != 14) {
      warningElement.style.display = "block";
    } else {warningElement.style.display = "none";}
      status.textContent = "Conversion successful!";
    } catch (error) {
      console.error(error);
      status.textContent = "Error converting file :(";
  }
};

  const file = fileInput.files[0];
  const fileName = file.name;
  if (fileName.endsWith(".json5")) {
    fileReader.readAsText(file, "UTF-8");
  } else if (fileName.endsWith(".json")) {
    fileReader.readAsText(file, "UTF-8");
  } else {status.textContent = "Please select a JSON or JSON5 file";}
}

function convertToJsonString(data, orderByWeaponName) {
  const lwpParams = [];
  const lwpOParams = [];
  const lwpSParams = [];
  const warningExtended = document.getElementById("warningext");
  const warningSpritesheet = document.getElementById("warningsprites");
  const warningTextures = document.getElementById("warningtextures");
  const warningNegativeValue = document.getElementById("warningnegative");
  const warningAdjustValue = document.getElementById("warningadjust");
  let ObjectOrder = lieroM8Plugin.checked ? -1 : 0;
  let SObjectOrder = lieroM8Plugin.checked ? -1 : 0;
  let weaponIndex = 0;

  let weaponSorted = data.weapons.map((w,idx) => {return {name:w.name,idSwap:(idx+1)}; }).sort((a,b) => {
    if (a.name<b.name) return -1;
    if (a.name>b.name) return 1;
    return 0;
  });

warningExtended.style.display = "none";
warningSpritesheet.style.display = "none";
warningTextures.style.display = "none";
warningNegativeValue.style.display = "none";
warningAdjustValue.style.display = "none";

  for (let i = 0; i < data.weapons.length; i++) {
    const weapon = data.weapons[i];
    const ignoredWeaponProperties = ["bulletType","laserBeam","distribution","id","reloadSound","$$hashKey"];
    weaponIndex++;
    const weaponParams = [];
    if (weapon.recoil<0 && !signedHack.checked) {
        warningNegativeValue.style.display = "block";
        console.log("negative recoil detected in weapon " + weapon.name);
        }

    for (let paramName in weapon) {
        if (ignoredWeaponProperties.includes(paramName)) {continue;}
        let lwpParamName = paramName.toUpperCase().replace(/\s+/g, "_");
        let paramValue = weapon[paramName];

        if (lwpParamName === "BULLETSPEEDINHERIT") {
            lwpParamName = "WORMAFFECT";
            paramValue = paramValue != 0 ? 1 : 0;
        }

        if (lwpParamName === "BULLETSPEED") {
            lwpParamName = "SPEED";
            if(paramValue<-327.68 || paramValue>327.67) {
                console.log("adjusting speed value in weapon " + weapon.name);
                warningAdjustValue.style.display = "block";
            }
            paramValue = paramValue < -327.68 ? -32768 : (paramValue > 327.67 ? 32767 : Math.floor(paramValue * 100));
        }

        if (lwpParamName === "RECOIL") {
            if(signedHack.checked) {
	        paramValue = Math.floor(paramValue * 100);
	        if (paramValue>127) {
                paramValue=127;
                console.log("adjusting recoil value in weapon " + weapon.name);
                warningAdjustValue.style.display = "block";
            }
	        if (paramValue<0) paramValue+=256;
	        if (paramValue<-128) {
                paramValue=128;
                console.log("adjusting recoil value in weapon " + weapon.name);
                warningAdjustValue.style.display = "block";
            }
            } else {
	        paramValue = Math.floor(Math.abs(paramValue * 100));
            if (paramValue>255) {
                paramValue=255;
                console.log("adjusting recoil value in weapon " + weapon.name);
                warningAdjustValue.style.display = "block";
            }
	    }
        }

        if (lwpParamName === "LAUNCHSOUND") {
            lwpParamName = "SOUNDLAUNCH";
            paramValue =  paramValue < 0 ? 0 : Math.floor(paramValue + 1);
        }

        if (lwpParamName === "PARTS") {
            lwpParamName = "NUMOBJECTS";
            if(paramValue<0 || paramValue>255) {
                console.log("adjusting numobjects value in weapon " + weapon.name);
                warningAdjustValue.style.display = "block";
            }
            paramValue =  paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
        }

        if (lwpParamName === "AMMO") {
            if(paramValue<0 || paramValue>255) {
                console.log("adjusting ammo value in weapon " + weapon.name);
                warningAdjustValue.style.display = "block";
            }
            paramValue =  paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
        }

        if (lwpParamName === "DELAY") {
            lwpParamName = "SHOTDELAY";
            if(paramValue<-32768 || paramValue>32767) {
                console.log("adjusting shotdelay value in weapon " + weapon.name);
                warningAdjustValue.style.display = "block";
            }
            paramValue = paramValue < -32768 ? -32768 : (paramValue > 32767 ? 32767 : Math.floor(paramValue));
        }

        if (lwpParamName === "PLAYRELOADSOUND") {
            lwpParamName = "RELOADSOUND";
        }

         if (lwpParamName === "LOADINGTIME") {
            if(paramValue<-32768 || paramValue>32767) {
                console.log("adjusting loadingtime value in weapon " + weapon.name);
                warningAdjustValue.style.display = "block";
            }
            paramValue = paramValue < -32768 ? -32768 : (paramValue > 32767 ? 32767 : Math.floor(paramValue));
        }

        if (lwpParamName === "FIRECONE") {
            if(paramValue<0 || paramValue>255) {
                console.log("adjusting firecone value in weapon " + weapon.name);
                warningAdjustValue.style.display = "block";
            }
            paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
        }
      
        if (lwpParamName === "LEAVESHELLDELAY") {
            lwpParamName = "SHELLDELAY";
            if(paramValue<0 || paramValue>255) {
                console.log("adjusting shelldelay value in weapon " + weapon.name);
                warningAdjustValue.style.display = "block";
            }
            paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
        }

        if (lwpParamName === "LEAVESHELLS") {
            if(paramValue<0 || paramValue>4) {
                console.log("adjusting leaveshells value in weapon " + weapon.name);
                warningAdjustValue.style.display = "block";
            }
            paramValue = paramValue < 0 ? 0 : (paramValue > 4 ? 4 : Math.floor(paramValue));
        }

        if (typeof paramValue === "boolean") {
          paramValue = paramValue ? "1" : "0";
        } 
        if (typeof paramValue === "number") {
          paramValue = Math.floor(paramValue);
        }

        weaponParams.push(`${lwpParamName}:${paramValue}`);
    }

doTheWobject(weaponIndex, data, weapon.bulletType, weaponParams, weaponSorted, orderByWeaponName, warningExtended, warningSpritesheet, warningTextures, warningNegativeValue, warningAdjustValue, lwpParams)
    }

for (let i = 0; i < data.nObjects.length; i++) {
      const nObject = data.nObjects[i];
      const ignoredNObjectProperties = ["id","name","teamImmunity","immutable","$$hashKey"];
      ObjectOrder++;
      const nObjectOParams = [];
      if (nObject.immutable==true || nObject.teamImmunity>0) {
	      warningExtended.style.display = "block";
	      console.log("extended property detected in nObject nid" + i);
      }
      if (nObject.startFrame>239) {
	      warningSpritesheet.style.display = "block";
	      console.log("spritesheet limit exceeded in nObject nid" + i);
      }
      if (nObject.dirtEffect>8) {
	      warningTextures.style.display = "block";
	      console.log("textures array limit exceeded in nObject nid" + i);
      }
      if (nObject.hitDamage<0 && !signedHack.checked) {
        	warningNegativeValue.style.display = "block";
        	console.log("negative hitDamage detected in nObject nid" + i);
      }

      for (let paramName in nObject) {
	  if (ignoredNObjectProperties.includes(paramName)) {continue;}
          let lwpParamName = paramName.toUpperCase().replace(/\s+/g, "_");
          let paramValue = nObject[paramName];

          if (lwpParamName === "SPLINTERTYPE") {
              paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
          }

          if (lwpParamName === "CREATEONEXP") {
              lwpParamName = "CREATEONHIT";
              paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
          }

          if (lwpParamName === "DIRTEFFECT") {
              lwpParamName = "MAPCHANGE";
              if(paramValue>8) {
                console.log("adjusting mapchange value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue > 8 ? 0 : Math.floor(paramValue + 1));
          }

          if (lwpParamName === "STARTFRAME") {
              lwpParamName = "ANIMSFRAME";
              if(paramValue>239) {
                console.log("adjusting animsframe value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue < 110 ? 0 : (paramValue > 239 ? 0 : Math.floor(paramValue - 110)));
          }

          if (lwpParamName === "DETECTDISTANCE") {
              lwpParamName = "WORMDETECTRANGE";
              if(paramValue<0 || paramValue>255) {
                console.log("adjusting wormdetectrange value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "BLOODONHIT") {
              lwpParamName = "BLOOD";
              if(paramValue<0 || paramValue>255) {
                console.log("adjusting blood value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "COLORBULLETS") {
              lwpParamName = "BULLETCOLOR";
              if(paramValue<0 || paramValue>255) {
                console.log("adjusting bulletcolor in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
			  paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "SPLINTERCOLOUR") {
              lwpParamName = "SPLINTERCOLOR";
              if(paramValue<0 || paramValue>255) {
                console.log("adjusting splintercolor value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
			  paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "DRAWONMAP") {
              lwpParamName = "DRAWOBJECT";
          }

          if (lwpParamName === "EXPLGROUND") {
              lwpParamName = "GROUNDREMOVE";
          }

          if (lwpParamName === "AFFECTBYEXPLOSIONS") {
              lwpParamName = "EXPLODEAFFECT";
          }

          if (lwpParamName === "WORMDESTROY") {
              lwpParamName = "WORMREMOVE";
          }

          if (lwpParamName === "NUMFRAMES") {
              lwpParamName = "ANIMFRAMES";
              if(paramValue<0 || paramValue>255) {
                console.log("adjusting animframes value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
	          paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "SPLINTERAMOUNT") {
            if(paramValue<0 || paramValue>255) {
                console.log("adjusting splinteramount value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "TIMETOEXPLO") {
              lwpParamName = "TIMETOEXPLODE";
              if(paramValue<-32768 || paramValue>32767) {
                console.log("adjusting timetoexplode value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < -32768 ? -32768 : (paramValue > 32767 ? 32767 : Math.floor(paramValue));
          }

          if (lwpParamName === "TIMETOEXPLOV") {
              lwpParamName = "TIMETOEXPLODEV";
              if(paramValue<-32768 || paramValue>32767) {
                console.log("adjusting timetoexplodev value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < -32768 ? -32768 : (paramValue > 32767 ? 32767 : Math.floor(paramValue));
          }

          if (lwpParamName === "BLOODTRAILDELAY") {
              lwpParamName = "BTRAILDELAY";
              if(paramValue<0 || paramValue>255) {
                console.log("adjusting btraildelay value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "BLOODTRAIL") {
              lwpParamName = "BTRAIL";
          }

          if (lwpParamName === "LEAVEOBJ") {
              lwpParamName = "OTRAILTYPE";
              paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
          }

          if (lwpParamName === "LEAVEOBJDELAY") {
              lwpParamName = "OTRAILDELAY";
              if(paramValue<0 || paramValue>255) {
                console.log("adjusting otraildelay value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "BOUNCE") {
              if(paramValue<0 || paramValue>2.55) {
                console.log("adjusting bounce value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue > 2.55 ? 255 : Math.floor(paramValue * 100));
          }

          if (lwpParamName === "SPEED") {
              if(paramValue<-327.68 || paramValue>327.67) {
                console.log("adjusting speed value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < -327.68 ? -32768 : (paramValue > 327.67 ? 32767 : Math.floor(paramValue * 100));
          }

          if (lwpParamName === "SPEEDV") {
              if(paramValue<-327.68 || paramValue>327.67) {
                console.log("adjusting speedv value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < -327.68 ? -32768 : (paramValue > 327.67 ? 32767 : Math.floor(paramValue * 100));
          }

          if (lwpParamName === "DISTRIBUTION") {
              if(paramValue<=-0.5 || paramValue>=0.5) {
                console.log("adjusting distribution value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue >= 0.5 ? 32767 : (paramValue <= -0.5 ? -32768 : Math.floor(paramValue * 65536));
          }

          if (lwpParamName === "GRAVITY") {
              if(paramValue<=-0.5 || paramValue>=0.5) {
                console.log("adjusting gravity value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue >= 0.5 ? 32767 : (paramValue <= -0.5 ? -32768 : Math.floor(paramValue * 65536));
          }

          if (lwpParamName === "BLOWAWAY") {
              lwpParamName = "BLOW";
              paramValue = Math.floor(Math.abs(paramValue * 100));
              if (paramValue>255) {
                paramValue=255;
                console.log("adjusting blow value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
          }

          if (lwpParamName === "HITDAMAGE") {
              if(paramValue<0 || paramValue>255) {
                console.log("adjusting bounce value in nobject nid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (typeof paramValue === "boolean") {
            paramValue = paramValue ? "1" : "0";
          } else if (typeof paramValue === "number") {
            paramValue = Math.floor(paramValue);
          }

          nObjectOParams.push(`${lwpParamName}:${paramValue}`);
      }

      if (nObjectOParams.length > 0) {
        lwpOParams.push(`OBJECT:${ObjectOrder}\r\n${nObjectOParams.join("\r\n")}\r\n`);
      }
  }

for (let i = 0; i < data.sObjects.length; i++) {
  const sObject = data.sObjects[i];
  const ignoredSObjectProperties = ["id","name","$$hashKey"];
  SObjectOrder++;
  const sObjectSParams = [];
      if (sObject.dirtEffect>8) {
      warningTextures.style.display = "block";
      console.log("textures array limit exceeded in sObject sid" + i);
      }
      if (sObject.startFrame>109) {
      warningSpritesheet.style.display = "block";
      console.log("spritesheet limit exceeded in sObject sid" + i);
      }
      if (sObject.hitDamage<0 && !signedHack.checked) {
      warningNegativeValue.style.display = "block";
      console.log("negative hitDamage detected in sObject sid" + i);
      }

      for (let paramName in sObject) {
	  if (ignoredSObjectProperties.includes(paramName)) {continue;}
          let lwpParamName = paramName.toUpperCase().replace(/\s+/g, "_");
          let paramValue = sObject[paramName];

          if (lwpParamName === "DIRTEFFECT") {
              lwpParamName = "MAPCHANGE";
              if(paramValue>8) {
                console.log("adjusting mapchange value in sobject sid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue > 8 ? 0 : Math.floor(paramValue + 1));
          }

          if (lwpParamName === "STARTFRAME") {
              lwpParamName = "ANIMSFRAME";
              if(paramValue>109) {
                console.log("adjusting animsframe value in sobject sid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue > 109 ? 0 : Math.floor(paramValue));
          }

          if (lwpParamName === "DETECTRANGE") {
              lwpParamName = "WORMDETECTRANGE";
              if(paramValue<0 || paramValue>255) {
                console.log("adjusting wormdetectrange value in sobject sid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "NUMFRAMES") {
              lwpParamName = "ANIMFRAMES";
              if(paramValue<0 || paramValue>255) {
                console.log("adjusting animframes value in sobject sid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "ANIMDELAY") {
              if(paramValue<0 || paramValue>255) {
                console.log("adjusting animdelay value in sobject sid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "DAMAGE") {
              lwpParamName = "HITDAMAGE";
              if(paramValue<0 || paramValue>255) {
                console.log("adjusting hitdamage value in sobject sid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "SHAKE") {
              lwpParamName = "EARTHQUAKE";
              if(paramValue<0 || paramValue>255) {
                console.log("adjusting earthquake value in sobject sid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "FLASH") {
              if(paramValue<0 || paramValue>255) {
                console.log("adjusting flash value in sobject sid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "NUMSOUNDS") {
              lwpParamName = "NUMOFSOUNDS";
              if(paramValue<0 || paramValue>255) {
                console.log("adjusting numofsounds value in sobject sid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
          }

          if (lwpParamName === "STARTSOUND") {
              lwpParamName = "FIRSTSOUND";
              paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
          }

          if (lwpParamName === "BLOWAWAY") {
              lwpParamName = "BLOW";
              if(paramValue<-30517 || paramValue>30517) {
                console.log("adjusting blow value in sobject sid" + i);
                warningAdjustValue.style.display = "block";
            }
              paramValue = paramValue < -30517 ? -1999999999 : (paramValue > 30517 ? 1999999999 : Math.floor(paramValue * 65536));
          }

          if (typeof paramValue === "boolean") {
            paramValue = paramValue ? "1" : "0";
          } else if (typeof paramValue === "number") {
            paramValue = Math.floor(paramValue);
          }

          sObjectSParams.push(`${lwpParamName}:${paramValue}`);
      }

      if (sObjectSParams.length > 0) {
        lwpSParams.push(`SOBJECT:${SObjectOrder}\r\n${sObjectSParams.join("\r\n")}\r\n`);
      }
}
   return `LIEROKIT:WEAPONPLUGIN\r\nPROMPT:This will activate the whole weapon list. Do you want to continue?\r\nOVERWRITE:1\r\n\r\n${lwpParams.join("\r\n")}\r\n${lwpOParams.join("\r\n")}\r\n${lwpSParams.join("\r\n")}`;
}

function doTheWobject(weaponIndex, data, wobjectId, weaponParams, weaponSorted, orderByWeaponName, warningExtended, warningSpritesheet, warningTextures, warningNegativeValue, warningAdjustValue, lwpParams) {
        const i = wobjectId;
        const wObject = data.wObjects[i];
        const ignoredWObjectProperties = ["id","name","speed","bounceFriction","repeat","immutable","fixed","behavior","platform","detonable","teamImmunity","removeOnSObject","platformWidth","platformHeight","platformVelocityAuto","$$hashKey","removeonsobject","overlay===undefined ? 0 : a","underlay===undefined ? 0 : a","overlay","underlay","beacon","behavior===undefined ? -1 : a"];
        const wObjectParams = [];
        if (wObject.behavior>=0 || wObject.detonable==true || wObject.immutable==true || wObject.fixed==true || wObject.platform==true || wObject.teamImmunity>0 || wObject.removeOnSObject==true || wObject.overlay==true) {
        warningExtended.style.display = "block";
        console.log("extended property detected in wObject wid" + i);
        }
        if (wObject.startFrame>239) {
        warningSpritesheet.style.display = "block";
        console.log("spritesheet limit exceeded in wObject wid" + i);
        }
        if (wObject.dirtEffect>8) {
        warningTextures.style.display = "block";
        console.log("textures array limit exceeded in wObject wid" + i);
        }
        if (wObject.hitDamage<0 && !signedHack.checked) {
        warningNegativeValue.style.display = "block";
        console.log("negative hitDamage detected in wObject wid" + i);
        }
        if (wObject.bounce<0 && !signedHack.checked) {
        warningNegativeValue.style.display = "block";
        console.log("negative bounce detected in wObject wid" + i);
        }

        for (let paramName in wObject) {
          if (ignoredWObjectProperties.includes(paramName)) {continue;}
            let lwpParamName = paramName.toUpperCase().replace(/\s+/g, "_");
            let paramValue = wObject[paramName];

            if (lwpParamName === "SHOTTYPE") {
				if(paramValue<0 || paramValue>4) {
					console.log("adjusting shottype value in wobject wid" + i);
					warningAdjustValue.style.display = "block";
                }
                paramValue = paramValue < 0 ? 0 : (paramValue > 4 ? 4 : Math.floor(paramValue));
            }
 
            if (lwpParamName === "SPLINTERTYPE") {
                paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
            }
  
            if (lwpParamName === "CREATEONEXP") {
                lwpParamName = "CREATEONHIT";
                paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
            }
  
            if (lwpParamName === "PARTTRAILOBJ") {
                lwpParamName = "PTRAILPTYPE";
                paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
            }
  
            if (lwpParamName === "DIRTEFFECT") {
                lwpParamName = "MAPCHANGE";
                if(paramValue>8) {
                    console.log("adjusting mapchange value in wobject wid" + i);
                    warningAdjustValue.style.display = "block";
                }
                paramValue = paramValue < 0 ? 0 : (paramValue > 8 ? 0 : Math.floor(paramValue + 1));
            }
  
            if (lwpParamName === "OBJTRAILTYPE") {
                lwpParamName = "OTRAILTYPE";
                paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
            }
  
            if (lwpParamName === "STARTFRAME") {
                lwpParamName = "ANIMSFRAME";
                if(paramValue<110 || paramValue>239) {
                    if(paramValue>0) {
                        console.log("adjusting animsframe value in wobject wid" + i);
                        warningAdjustValue.style.display = "block";
                    }
                }
                paramValue = paramValue < 0 ? -1 : (paramValue < 110 ? 0 : (paramValue > 239 ? 0 : Math.floor(paramValue - 110)));
            }
  
            if (lwpParamName === "DETECTDISTANCE") {
                lwpParamName = "WORMDETECTRANGE";
                if(paramValue<0 || paramValue>255) {
                    console.log("adjusting wormdetectrange value in wobject wid" + i);
                    warningAdjustValue.style.display = "block";
                }
                paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
            }

            if (lwpParamName === "BLOODONHIT") {
                lwpParamName = "BLOOD";
                if(paramValue<0 || paramValue>255) {
                    console.log("adjusting blood value in wobject wid" + i);
                    warningAdjustValue.style.display = "block";
                }
                paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
            }

            if (lwpParamName === "ADDSPEED") {
                lwpParamName = "ACCADD";
                if(paramValue<-32768 || paramValue>32767) {
                    console.log("adjusting accadd value in wobject wid" + i);
                    warningAdjustValue.style.display = "block";
                }
                paramValue = paramValue < -32768 ? -32768 : (paramValue > 32767 ? 32767 : Math.floor(paramValue));
            }

            if (lwpParamName === "SPLINTERCOLOUR") {
                lwpParamName = "SPLINTERCOLOR";
                if(paramValue<0 || paramValue>255) {
                    console.log("adjusting splintercolor value in wobject wid" + i);
                    warningAdjustValue.style.display = "block";
                }
				paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
            }

            if (lwpParamName === "EXPLGROUND") {
                lwpParamName = "GROUNDEXPLODE";
            }
  
            if (lwpParamName === "COLLIDEWITHOBJECTS") {
                lwpParamName = "OBJECTCOLLIDE";
            }
  
            if (lwpParamName === "AFFECTBYEXPLOSIONS") {
                lwpParamName = "EXPLODEAFFECT";
            }
  
            if (lwpParamName === "COLORBULLETS") {
                lwpParamName = "BULLETCOLOR";
                if(paramValue<0 || paramValue>255) {
                    console.log("adjusting bulletcolor value in wobject wid" + i);
                    warningAdjustValue.style.display = "block";
                }
				paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
            }
  
            if (lwpParamName === "EXPLOSOUND") {
                lwpParamName = "SOUNDEXPLODE";
                paramValue = paramValue = paramValue < 0 ? 0 : Math.floor(paramValue + 1);
            }
  
            if (lwpParamName === "PARTTRAILDELAY") {
                lwpParamName = "PTRAILDELAY";
                if(paramValue<0 || paramValue>255) {
                    console.log("adjusting ptraildelay value in wobject wid" + i);
                    warningAdjustValue.style.display = "block";
                }
                paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
            }
  
            if (lwpParamName === "PARTTRAILTYPE") {
                lwpParamName = "PTRAILTYPE";
                paramValue = paramValue < 0 ? 0 : (paramValue > 1 ? 1 : Math.floor(paramValue));
            }
  
            if (lwpParamName === "WORMCOLLIDE") {
                lwpParamName = "WORMREMOVE";
            }
  
            if (lwpParamName === "SPLINTERSCATTER") {
                lwpParamName = "SPLINTERSTYPE";
                paramValue = paramValue < 0 ? 0 : (paramValue > 1 ? 1 : Math.floor(paramValue));
            }
  
            if (lwpParamName === "NUMFRAMES") {
                lwpParamName = "ANIMFRAMES";
                if(paramValue<0 || paramValue>255) {
                    console.log("adjusting animframes value in wobject wid" + i);
                    warningAdjustValue.style.display = "block";
                }
      		    paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
            }
          
            if (lwpParamName === "LOOPANIM") {
                lwpParamName = "ANIMLOOP";
            }
  
            if (lwpParamName === "SPLINTERAMOUNT") {
                if(paramValue<0 || paramValue>255) {
                    console.log("adjusting splinteramount value in wobject wid" + i);
                    warningAdjustValue.style.display = "block";
                }
                paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
            }
  
            if (lwpParamName === "TIMETOEXPLO") {
                lwpParamName = "TIMETOEXPLODE";
                if(paramValue<-32768 || paramValue>32767) {
                    console.log("adjusting timetoexplode value in wobject wid" + i);
                    warningAdjustValue.style.display = "block";
                }
                paramValue = paramValue < -32768 ? -32768 : (paramValue > 32767 ? 32767 : Math.floor(paramValue));
            }
  
            if (lwpParamName === "TIMETOEXPLOV") {
                lwpParamName = "TIMETOEXPLODEV";
                if(paramValue<-32768 || paramValue>32767) {
                    console.log("adjusting timetoexplodev value in wobject wid" + i);
                    warningAdjustValue.style.display = "block";
                }
                paramValue = paramValue < -32768 ? -32768 : (paramValue > 32767 ? 32767 : Math.floor(paramValue));
            }
  
            if (lwpParamName === "OBJTRAILDELAY") {
                lwpParamName = "OTRAILDELAY";
                if(paramValue<0 || paramValue>255) {
                    console.log("adjusting otraildelay value in wobject wid" + i);
                    warningAdjustValue.style.display = "block";
                }
                paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
            }
  
            if (lwpParamName === "MULTSPEED") {
                lwpParamName = "ACCMULTIPLY";
                if(paramValue<-327.68 || paramValue>327.67) {
                    console.log("adjusting accmultiply value in wobject wid" + i);
                    warningAdjustValue.style.display = "block";
                }
                paramValue = paramValue < -327.68 ? -32768 : (paramValue > 327.67 ? 32767 : Math.floor(paramValue * 100));
            }
  
            if (lwpParamName === "BOUNCE") {
                if(signedHack.checked) {
                    paramValue = Math.floor(paramValue * 100);
                    if (paramValue>127) {
                        paramValue=127;
                        console.log("adjusting bounce value in wobject wid" + i);
                        warningAdjustValue.style.display = "block";
                    }
                    if (paramValue<0) paramValue+=256;
                    if (paramValue<-128) {
                        paramValue=128;
                        console.log("adjusting bounce value in wobject wid" + i);
                        warningAdjustValue.style.display = "block";
                    }
                } else {
                    if (paramValue>2.55 || paramValue<0) {
                        console.log("adjusting bounce value in wobject wid" + i);
                        warningAdjustValue.style.display = "block";
                    } 
                    paramValue = paramValue < 0 ? 0 : (paramValue > 2.55 ? 255 : Math.floor(paramValue * 100));
                }
            }
  
            if (lwpParamName === "HITDAMAGE") {
                if(signedHack.checked) {
                    paramValue = Math.floor(paramValue);
                    if (paramValue>127) {
                        paramValue=127;
                        console.log("adjusting hitdamage value in wobject wid" + i);
                        warningAdjustValue.style.display = "block";
                    }
                    if (paramValue<0) paramValue+=256;
                    if (paramValue<-128) {
                        paramValue=128;
                        console.log("adjusting hitdamage value in wobject wid" + i);
                        warningAdjustValue.style.display = "block";
                    }
                } else {
                    if (paramValue>255 || paramValue<0) {
                        console.log("adjusting hitdamage value in wobject wid" + i);
                        warningAdjustValue.style.display = "block";
                    }
                    paramValue = paramValue < 0 ? 0 : (paramValue > 255 ? 255 : Math.floor(paramValue));
                }
            }
  
            if (lwpParamName === "DISTRIBUTION") {
                if(paramValue<=-0.5 || paramValue>=0.5) {
                    console.log("adjusting distribution value in wobject wid" + i);
                    warningAdjustValue.style.display = "block";
                }
                paramValue = paramValue >= 0.5 ? 32767 : (paramValue <= -0.5 ? -32768 : Math.floor(paramValue * 65536));
  
            }
  
            if (lwpParamName === "GRAVITY") {
                if(paramValue<=-0.5 || paramValue>=0.5) {
                    console.log("adjusting gravity value in wobject wid" + i);
                    warningAdjustValue.style.display = "block";
                }
                paramValue = paramValue >= 0.5 ? 32767 : (paramValue <= -0.5 ? -32768 : Math.floor(paramValue * 65536));
            }
  
            if (lwpParamName === "BLOWAWAY") {
                lwpParamName = "BLOW";
                if(signedHack.checked) {
                    paramValue = Math.floor(paramValue * 100);
                    if (paramValue>127) {
                        paramValue=127;
                        console.log("adjusting blow value in wobject wid" + i);
                        warningAdjustValue.style.display = "block";
                    }
                    if (paramValue<0) paramValue+=256;
                    if (paramValue<-128) {
                        paramValue=128;
                        console.log("adjusting blow value in wobject wid" + i);
                        warningAdjustValue.style.display = "block";
                    }
                } else {
					paramValue = Math.floor(Math.abs(paramValue * 100));
                    if (paramValue>255) {
                        paramValue=255;
                        console.log("adjusting blow value in wobject wid" + i);
                        warningAdjustValue.style.display = "block";
                    }
	            }
            }
  
            if (typeof paramValue === "boolean") {
              paramValue = paramValue ? "1" : "0";
            } else if (typeof paramValue === "number") {
              paramValue = Math.floor(paramValue);
            }
  
            wObjectParams.push(`${lwpParamName}:${paramValue}`);
          }
  
        if (wObjectParams.length > 0) {
       
          const weaponOrder = orderByWeaponName
          ? weaponSorted[weaponIndex - 1].idSwap
          : weaponIndex;
        
          lwpParams.push(`WEAPON:${weaponIndex}\r\nORDER:${weaponOrder}\r\n${weaponParams.join("\r\n")}\r\n${wObjectParams.join("\r\n")}\r\nSHADOW:1\r\nSOUNDLOOP:0\r\n`);
        } 
}


