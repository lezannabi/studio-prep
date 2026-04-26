import { AppShell } from "./components/AppShell";
import { LoadingScreen } from "./components/LoadingScreen";
import { SmartStorePlaceholderScreen } from "./screens/SmartStorePlaceholderScreen";
import { WorkspaceScreen } from "./screens/WorkspaceScreen";
import { useStudioPrepState } from "./state/useStudioPrepState";

export default function App() {
  const store = useStudioPrepState();

  if (store.isBooting || !store.data) {
    return <LoadingScreen />;
  }

  const data = store.data;

  const renderView = () => {
    switch (store.activeView) {
      case "project":
      case "text":
      case "review":
      case "dashboard":
        return (
          <WorkspaceScreen
            activeView={store.activeView}
            data={data}
            project={store.selectedProject}
            projectImages={store.projectImages}
            selectedImage={store.selectedImage}
            selectedImageId={store.selectedImageId}
            projectForm={store.projectForm}
            projectEditorMode={store.projectEditorMode}
            projectImagesForEditor={store.projectImages}
            folderSyncError={store.folderSyncError}
            presets={store.projectPresets}
            onChangeView={store.setActiveView}
            onSelectProject={store.selectProject}
            onSelectImage={store.setSelectedImageId}
            onSetImageStatus={store.setImageStatus}
            onSetCover={(imageId) =>
              store.selectedProject && store.setCoverImage(store.selectedProject.id, imageId)
            }
            onSelectDraft={store.selectDraft}
            onUpdateTextEnum={(field, value) => store.updateTextEnum(field, value as never)}
            onUpdateTextField={store.updateTextField}
            onUpdateFinalText={store.updateFinalText}
            onApplyRewritePreset={store.applyRewritePreset}
            onToggleChecklist={store.toggleChecklistItem}
            onTogglePreset={store.markPresetReady}
            onResetSession={store.resetSession}
            onProjectFormChange={store.updateProjectForm}
            onProjectUploadFilesChange={store.updateProjectUploadFiles}
            onRemoveProjectImage={store.removeProjectImage}
            onSyncProjectFolderImages={store.syncProjectFolderImages}
            projectUploadFiles={store.projectUploadFiles}
            onCreateProject={store.createProject}
            onUpdateProject={store.saveProjectMeta}
            onDeleteProject={store.deleteProject}
            onStartCreateProject={store.startCreateProject}
            onEditProject={store.editProjectMeta}
            onReorderProjectImages={store.reorderProjectImages}
          />
        );
      case "smartstore":
        return <SmartStorePlaceholderScreen />;
      default:
        return null;
    }
  };

  return (
    <AppShell activeView={store.activeView} isSmartStoreView={store.activeView === "smartstore"}>
      {renderView()}
    </AppShell>
  );
}
