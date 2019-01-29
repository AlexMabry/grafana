import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import Page from 'app/core/components/Page/Page';
import appEvents from 'app/core/app_events';
import { getNavModel } from 'app/core/selectors/navModel';
import { NavModel, StoreState, FolderState } from 'app/types';
import { getFolderByUid, setFolderTitle, saveFolder, deleteFolder } from './state/actions';
import { getLoadingNav } from './state/navModel';

export interface Props {
  navModel: NavModel;
  folderUid: string;
  folder: FolderState;
  getFolderByUid: typeof getFolderByUid;
  setFolderTitle: typeof setFolderTitle;
  saveFolder: typeof saveFolder;
  deleteFolder: typeof deleteFolder;
}

export interface State {
  isLoading: boolean;
}

export class FolderSettingsPage extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  componentDidMount() {
    this.props.getFolderByUid(this.props.folderUid);
  }

  onTitleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.setFolderTitle(evt.target.value);
  };

  onSave = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    evt.stopPropagation();
    this.setState({isLoading: true});
    await this.props.saveFolder(this.props.folder);
    this.setState({isLoading: false});
  };

  onDelete = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.stopPropagation();
    evt.preventDefault();

    appEvents.emit('confirm-modal', {
      title: 'Delete',
      text: `Do you want to delete this folder and all its dashboards?`,
      icon: 'fa-trash',
      yesText: 'Delete',
      onConfirm: () => {
        this.props.deleteFolder(this.props.folder.uid);
      },
    });
  };

  render() {
    const { navModel, folder } = this.props;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.isLoading}>
          <div className="page-container page-body">
            <h2 className="page-sub-heading">Folder Settings</h2>

            <div className="section gf-form-group">
              <form name="folderSettingsForm" onSubmit={this.onSave}>
                <div className="gf-form">
                  <label className="gf-form-label width-7">Name</label>
                  <input
                    type="text"
                    className="gf-form-input width-30"
                    value={folder.title}
                    onChange={this.onTitleChange}
                  />
                </div>
                <div className="gf-form-button-row">
                  <button type="submit" className="btn btn-success" disabled={!folder.canSave || !folder.hasChanged}>
                    <i className="fa fa-save" /> Save
                  </button>
                  <button className="btn btn-danger" onClick={this.onDelete} disabled={!folder.canSave}>
                    <i className="fa fa-trash" /> Delete
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Page.Contents>
      </Page>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  const uid = state.location.routeParams.uid;

  return {
    navModel: getNavModel(state.navIndex, `folder-settings-${uid}`, getLoadingNav(2)),
    folderUid: uid,
    folder: state.folder,
  };
};

const mapDispatchToProps = {
  getFolderByUid,
  saveFolder,
  setFolderTitle,
  deleteFolder,
};

export default hot(module)(connect(mapStateToProps, mapDispatchToProps)(FolderSettingsPage));
