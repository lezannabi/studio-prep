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
  const activeWorkspaceView = store.activeView === "text" ? "project" : store.activeView;

  const renderView = () => {
    switch (activeWorkspaceView) {
      case "project":
      case "review":
      case "dashboard":
        return (
          <WorkspaceScreen
            activeView={activeWorkspaceView}
            data={data}
            project={store.selectedProject}
            projectImages={store.projectImages}
            selectedImage={store.selectedImage}
            selectedImageId={store.selectedImageId}
            projectForm={store.projectForm}
            projectEditorMode={store.projectEditorMode}
            projectImagesForEditor={store.projectImages}
            folderSyncError={store.folderSyncError}
            projectImportError={store.projectImportError}
            exportFeedback={store.exportFeedback}
            aiFeedback={store.aiFeedback}
            pendingAiSuggestion={store.pendingAiSuggestion}
            presets={store.projectPresets}
            onChangeView={store.setActiveView}
            onSelectProject={store.selectProject}
            onSelectImage={store.setSelectedImageId}
            onSetImageStatus={store.setImageStatus}
            onSetCover={(imageId) =>
              store.selectedProject && store.setCoverImage(store.selectedProject.id, imageId)
            }
            onRunAiImageCuration={store.runAiImageCuration}
            onApplyPendingAiSuggestion={store.applyPendingAiSuggestion}
            onApplyPendingAiSuggestionToImage={store.applyPendingAiSuggestionToImage}
            onDismissPendingAiSuggestion={store.dismissPendingAiSuggestion}
            onToggleChecklist={store.toggleChecklistItem}
            onTogglePreset={store.markPresetReady}
            onExecuteExport={store.executeProjectExport}
            onPickExportFolder={store.pickProjectExportFolder}
            onResetSession={store.resetSession}
            onProjectFormChange={store.updateProjectForm}
            onProjectUploadFilesChange={store.updateProjectUploadFiles}
            onRemoveProjectImage={store.removeProjectImage}
            onSyncProjectFolderImages={store.syncProjectFolderImages}
            onImportProjectFile={store.importProjectFile}
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
