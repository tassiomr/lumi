import { site } from "@/lib/site";
import { ContactEmail } from "./Contact";
import { OrPending } from "./Pending";

/**
 * Identificação do controlador (LGPD art. 9º, III) — somente dados fornecidos pela TR Media.
 * CNPJ e endereço são opcionais: após a revisão legal, linhas vazias são omitidas.
 */
export function ControllerInfo() {
  const c = site.controller;
  return (
    <table>
      <tbody>
        <tr>
          <th scope="row">Aplicativo</th>
          <td>{site.name} para iOS ({site.bundleId})</td>
        </tr>
        <tr>
          <th scope="row">Desenvolvedor</th>
          <td>{site.developer}</td>
        </tr>
        <tr>
          <th scope="row">Controlador dos dados</th>
          <td><OrPending value={c.name} label="razão social ou nome do responsável" /></td>
        </tr>
        {c.document || !site.legalReviewed ? (
          <tr>
            <th scope="row">CNPJ / registro</th>
            <td><OrPending value={c.document} label="CNPJ ou registro, se houver" /></td>
          </tr>
        ) : null}
        {c.address || !site.legalReviewed ? (
          <tr>
            <th scope="row">Endereço</th>
            <td><OrPending value={c.address} label="endereço para correspondência, se houver" /></td>
          </tr>
        ) : null}
        <tr>
          <th scope="row">Encarregado (DPO)</th>
          <td>
            {c.dpoName ? (
              c.dpoName
            ) : (
              <>Canal do encarregado: <ContactEmail kind="privacy" subject="LGPD — Encarregado" /></>
            )}
          </td>
        </tr>
        <tr>
          <th scope="row">Contato de privacidade</th>
          <td><ContactEmail kind="privacy" subject="Privacidade — Lumi" /></td>
        </tr>
      </tbody>
    </table>
  );
}
