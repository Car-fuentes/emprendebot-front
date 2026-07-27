import { useState } from 'react'
import type { GeneratedQuoteMessageData } from '../../types'
import { openQuoteDocument, shareQuoteDocument } from '../../utils/quoteDocumentActions'
import { getQuoteStatusLabel } from '../../utils/quoteStatus'

interface GeneratedQuoteCardProps {
  data: GeneratedQuoteMessageData
  businessName: string
}

export function GeneratedQuoteCard({ data, businessName }: GeneratedQuoteCardProps) {
  const [documentError, setDocumentError] = useState<string | null>(null)
  const canShare = Boolean(data.pdfUrl && typeof navigator !== 'undefined' && navigator.share)

  const openPdf = () => {
    if (!data.pdfUrl) return
    const result = openQuoteDocument(data.pdfUrl)
    setDocumentError(
      result === 'blocked'
        ? 'No pudimos abrir el documento. Revisá que el navegador permita ventanas emergentes.'
        : result === 'invalid'
          ? 'El enlace del documento no es válido.'
          : null,
    )
  }

  const sharePdf = async () => {
    if (!data.pdfUrl) return
    const result = await shareQuoteDocument({
      url: data.pdfUrl,
      businessName,
      quoteNumber: data.number,
    })
    if (result === 'unsupported') openPdf()
  }

  return (
    <article className="chat-quote-card chat-quote-card--generated" aria-label="Solicitud de presupuesto">
      <header className="chat-quote-card__header chat-quote-card__header--status">
        <div>
          <h3>{data.number ? `Presupuesto ${data.number}` : 'Solicitud de presupuesto'}</h3>
          {data.issuedAt && <p>{new Date(data.issuedAt).toLocaleDateString('es-AR')}</p>}
        </div>
        {data.status && (
          <span className={`chat-quote-status chat-quote-status--${data.status.toLowerCase()}`}>
            {getQuoteStatusLabel(data.status)}
          </span>
        )}
      </header>

      <div className="chat-quote-card__body">
        <p className="chat-quote-card__success">
          Tu solicitud fue registrada correctamente. El negocio revisará la información y se
          pondrá en contacto con vos.
        </p>

        {data.pdfUrl ? (
          <div className="chat-quote-card__actions">
            <button type="button" className="chat-quote-card__primary" onClick={openPdf}>
              Ver PDF
            </button>
            {canShare && (
              <button type="button" className="chat-quote-card__secondary" onClick={() => void sharePdf()}>
                Compartir
              </button>
            )}
          </div>
        ) : (
          <p className="chat-quote-card__notice">
            El documento PDF todavía no está disponible.
          </p>
        )}

        {documentError && <p className="chat-quote-card__error" role="alert">{documentError}</p>}
      </div>
    </article>
  )
}
