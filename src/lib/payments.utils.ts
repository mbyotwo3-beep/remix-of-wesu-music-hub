/**
 * Pure utility functions for DPO Pay XML building and parsing.
 * Extracted so they can be unit-tested without pulling in @tanstack/react-start.
 */

/**
 * Build the DPO Pay createToken XML payload.
 */
export function buildCreateTokenXml(opts: {
  companyToken: string;
  serviceType: string;
  amount: number;
  companyRef: string;
  redirectUrl: string;
  backUrl: string;
  itemType: string;
  phone?: string | null;
}): string {
  const serviceDate = new Date().toISOString().replace("T", " ").slice(0, 19);
  const phoneElement = opts.phone ? `<PhoneNumber>${opts.phone}</PhoneNumber>` : "";

  return `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${opts.companyToken}</CompanyToken>
  <Request>createToken</Request>
  <Transaction>
    <PaymentAmount>${opts.amount.toFixed(2)}</PaymentAmount>
    <PaymentCurrency>ZMW</PaymentCurrency>
    <CompanyRef>${opts.companyRef}</CompanyRef>
    <RedirectURL>${opts.redirectUrl}</RedirectURL>
    <BackURL>${opts.backUrl}</BackURL>
    <CompanyRefUnique>0</CompanyRefUnique>
    <PTL>5</PTL>
    ${phoneElement}
  </Transaction>
  <Services>
    <Service>
      <ServiceType>${opts.serviceType}</ServiceType>
      <ServiceDescription>WESU+ ${opts.itemType}</ServiceDescription>
      <ServiceDate>${serviceDate}</ServiceDate>
    </Service>
  </Services>
</API3G>`;
}

/**
 * Extract a value from an XML string using a simple regex.
 * Returns the first match of <tagName>...</tagName>.
 */
export function extractXmlTag(xml: string, tagName: string): string | null {
  const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`));
  return match ? match[1].trim() : null;
}
