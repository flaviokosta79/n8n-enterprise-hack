import { Service } from '@n8n/di';
import { DataSource, Repository } from '@n8n/typeorm';
import { tenantContext } from '@/multitenancy/context';

import { WorkflowTagMapping } from '../entities/workflow-tag-mapping';

@Service()
export class WorkflowTagMappingRepository extends Repository<WorkflowTagMapping> {
	constructor(dataSource: DataSource) {
		super(WorkflowTagMapping, dataSource.manager);
	}

	async overwriteTaggings(workflowId: string, tagIds: string[]) {
		const tenantId = tenantContext.getStore()?.tenantId ?? '';
		return await this.manager.transaction(async (tx) => {
			await tx.delete(WorkflowTagMapping, { workflow: { id: workflowId, tenantId } });

			const taggings = tagIds.map((tagId) => this.create({ workflowId, tagId }));

			return await tx.insert(WorkflowTagMapping, taggings);
		});
	}
}
