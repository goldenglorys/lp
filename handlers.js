import { request, response } from "express";
import { writeFileSync, readFileSync } from "fs";
import {
  ParseFeeConfigurationSpec,
  GetApplicableFCS,
  AllocateTransactionFee,
  GetPrioritizedFCS,
} from "./helpers.js";

const GetPing = async (request, response) => {
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
    const FCS = await ParseFeeConfigurationSpec(FeeConfigurationSpec);
    const FCSData = JSON.stringify(FCS);
    writeFileSync("data/FeeConfigurationSpec.json", FCSData);
    return response.status(200).json({ status: "ok" });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};

const ComputeTransactionFee = async (request, response) => {
  try {
    let StoredFCSData = readFileSync("data/FeeConfigurationSpec.json");
    let ParsedFCSData = await JSON.parse(StoredFCSData);
    const { ID, Amount, Currency, CurrencyCountry, Customer, PaymentEntity } =
      request.body;

    const PayloadFCSData = {
      FeeCurrency: Currency ? Currency : "*",
      FeeLocale: !CurrencyCountry
        ? "*"
        : CurrencyCountry === PaymentEntity.Country
        ? "LOCL"
        : "INTL",
      FeeEntity: PaymentEntity.Type ? PaymentEntity.Type : "*",
      FeeEntityProperty: PaymentEntity.Brand ? PaymentEntity.Brand : "*",
    };

    const ApplicableFCS = await GetApplicableFCS(ParsedFCSData, PayloadFCSData);

    if (!ApplicableFCS.length) {
      return response.status(404).json({
        Error: `No fee configuration for ${Currency} transactions.`,
      });
    } else if (ApplicableFCS.length === 1) {
      const AttributedFee = await AllocateTransactionFee(
        ApplicableFCS[0],
        Amount
      );
      return response.status(200).json({
        AppliedFeeID: ApplicableFCS[0].FeeId,
        AppliedFeeValue: Math.round(AttributedFee),
        ChargeAmount: Customer.BearsFee ? Amount + AttributedFee : Amount,
        SettlementAmount: Customer.BearsFee ? Amount : Amount - AttributedFee,
      });
    } else if (ApplicableFCS.length > 1) {
      const FCS = await GetPrioritizedFCS(ApplicableFCS);
      const AttributedFee = await AllocateTransactionFee(
        ApplicableFCS[FCS.index],
        Amount
      );
      return response.status(200).json({
        AppliedFeeID: ApplicableFCS[FCS.index].FeeId,
        AppliedFeeValue: Math.round(AttributedFee),
        ChargeAmount: Customer.BearsFee ? Amount + AttributedFee : Amount,
        SettlementAmount: Customer.BearsFee ? Amount : Amount - AttributedFee,
      });
    }
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};

export { GetPing, SetupFeesSpec, ComputeTransactionFee };
