// Configuração declarativa da instância Camilla Bonifácio.
// Não contém segredos e ainda não está conectada ao worker.

export default {
  id: "camilla-bonifacio",
  vertical: "real-estate",
  platform: "cloudflare",
  bindings: {
    database: "DB",
    assets: "ASSETS"
  },
  database: {
    logicalName: "camilla-bonifacio-leads",
    leadTable: "camilla_leads"
  },
  features: {
    duplicateDetection: true,
    whatsappHandoff: true,
    realEstatePipeline: true,
    retailFinance: false
  }
};
