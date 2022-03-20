import { writeFileSync } from 'fs';

const getPing = async (request, response) => {
  await response.json({
    success: true,
    result: "pong!",
  });
};

const SetupFeesSpec = async (request, response) => {
  try {
    if (!request.body.FeeConfigurationSpec) {
      return response.status(400).json({
        success: false,
        message: "FeeConfigurationSpec body parameter is empty",
      });
    }
    const FeeConfigurationSpec = request.body.FeeConfigurationSpec.split("\n");
    const FCS = FeeConfigurationSpec.map((FCS) => {
      let SpecObj = {
        FeeId: FCS.split(" ")[0],
        FeeCurrency: FCS.split(" ")[1],
        FeeLocale: FCS.split(" ")[2],
        FeeEntity: FCS.split(" ")[3].split("(")[0],
        FeeEntityProperty: FCS.split(" ")[3].split("(")[1].replace(")", ""),
        FeeType: FCS.split(" ")[6],
        value: FCS.split(" ")[7],
      };
      return SpecObj
    });
    let FCSData = JSON.stringify(FCS);
    writeFileSync("data/FeeConfigurationSpec.json", FCSData);
    return response.status(200).json({ status: "ok" });
  } catch (error) {
    console.log(error);
    return response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};

export { getPing, SetupFeesSpec };
