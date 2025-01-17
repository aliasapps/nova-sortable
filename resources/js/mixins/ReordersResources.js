import { canSortResource } from '../tool';

export default {
  data: () => ({
    reorderLoading: false,
  }),
  computed: {
    canSeeReorderButtons() {
      const resource = this.resource || (this.resources && this.resources[0]);
      return resource ? canSortResource(resource, this.relationshipType) : false;
    },
  },
  methods: {
    async updateOrder(event) {
      this.reorderLoading = true;

      try {
        await Nova.request().post(`/nova-vendor/nova-sortable/sort/${this.resourceName}/update-order`, {
          resourceId: null,
          resourceIds: this.resources.map(r => r.id.value),
          viaResource: this.viaResource,
          viaResourceId: this.viaResourceId,
          viaRelationship: this.viaRelationship,
          relationshipType: this.relationshipType,
          relatedResource: this.viaResource,
        });
        await this.refreshResourcesList();
        Nova.success(this.__('novaSortable.reorderSuccessful'));
      } catch (e) {
        if (e && e.response && e.response.data && e.response.data.canNotReorder) {
          const id = e.response.data.canNotReorder;
          Nova.error(this.__('novaSortable.reorderNotAllowedFor', { id }));
          this.refreshResourcesList();
          return;
        }
        Nova.error(this.__('novaSortable.reorderError'));
      }

      this.reorderLoading = false;
    },

    async moveToStart(resource) {
      this.reorderLoading = true;
      try {
        await Nova.request().post(`/nova-vendor/nova-sortable/sort/${this.resourceName}/move-to-start`, {
          resourceId: resource.id.value,
          viaResource: this.viaResource,
          viaResourceId: this.viaResourceId,
          viaRelationship: this.viaRelationship,
          relationshipType: this.relationshipType,
          relatedResource: this.viaResource,
        });
        await this.refreshResourcesList();
        Nova.success(this.__('novaSortable.moveToStartSuccessful'));
      } catch (e) {
        Nova.error(this.__('novaSortable.reorderError'));
      }
      this.reorderLoading = false;
    },

    async moveToEnd(resource) {
      this.reorderLoading = true;
      try {
        await Nova.request().post(`/nova-vendor/nova-sortable/sort/${this.resourceName}/move-to-end`, {
          resourceId: resource.id.value,
          viaResource: this.viaResource,
          viaResourceId: this.viaResourceId,
          viaRelationship: this.viaRelationship,
          relationshipType: this.relationshipType,
          relatedResource: this.viaResource,
        });
        await this.refreshResourcesList();
        Nova.success(this.__('novaSortable.moveToEndSuccessful'));
      } catch (e) {
        Nova.error(this.__('novaSortable.reorderError'));
      }
      this.reorderLoading = false;
    },

    async refreshResourcesList() {
      // ! Might break with new Laravel Nova versions
      let parent = this.$parent;
      while (parent && !parent.getResources) {
        parent = parent.$parent;
      }
      if (parent && parent.getResources) await parent.getResources();
    },
  },
};
