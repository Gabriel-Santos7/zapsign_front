import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { DocumentStatus } from '../../models/document.model';
import { SignerStatus } from '../../models/signer.model';
import { STATUS_LABELS, STATUS_COLORS, SIGNER_STATUS_LABELS, SIGNER_STATUS_COLORS } from '../../utils/constants';

@Component({
  selector: 'app-status-badge',
  imports: [CommonModule, TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-tag
      [value]="label()"
      [severity]="severity()"
      [ariaLabel]="'Status: ' + label()"
    />
  `,
})
export class StatusBadgeComponent {
  status = input.required<DocumentStatus | SignerStatus>();

  label = computed(() => {
    const s = this.status();
    if (this.isDocumentStatus(s)) {
      return STATUS_LABELS[s];
    }
    return SIGNER_STATUS_LABELS[s];
  });

  severity = computed(() => {
    const s = this.status();
    if (this.isDocumentStatus(s)) {
      return STATUS_COLORS[s];
    }
    return SIGNER_STATUS_COLORS[s];
  });

  private isDocumentStatus(
    status: DocumentStatus | SignerStatus
  ): status is DocumentStatus {
    return status in STATUS_LABELS;
  }
}

