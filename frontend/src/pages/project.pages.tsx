import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Project } from '../features/project/interfaces';
import { IState } from '../store';
import { connect } from 'react-redux';
import { GroupsWithOwner } from '../features/group/interfaces';
import { Avatar, Input, Select, Popconfirm } from 'antd';
import { getProject } from '../features/project/actions';
import { iconMapper } from '../components/side-menu/side-menu.compoennt';
import { TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import EditProject from '../components/modals/edit-project.component';

type ProjectPathParams = {
  projectId: string;
};

type ModalState = {
  isShow: boolean;
  groupName: string;
};

type GroupProps = {
  groups: GroupsWithOwner[];
};

interface ProjectPathProps extends RouteComponentProps<ProjectPathParams> {
  projectId: string;
}

type ProjectPageProps = {
  project: Project;
  getProject: (projectId: number) => void;
};

class ProjectPage extends React.Component<
  ProjectPageProps & ProjectPathProps & GroupProps,
  ModalState
> {
  state: ModalState = {
    isShow: false,
    groupName: ''
  };

  componentDidMount() {
    const projectId = this.props.match.params.projectId;
    this.props.getProject(parseInt(projectId));
  }

  componentDidUpdate(prevProps: ProjectPathProps): void {
    const projectId = this.props.match.params.projectId;
    if (projectId !== prevProps.match.params.projectId) {
      this.props.getProject(parseInt(projectId));
    }
  }

  onClickGroup = (groupId: number) => {
    this.props.history.push(`/groups/group${groupId}`);
  };

  saveProject = () => {
    this.setState({ isShow: false });
  };

  onCancel = () => {
    this.setState({ isShow: false });
  };

  render() {
    const { groups: groupsByOwner } = this.props;
    const { project } = this.props;

    return (
      <div className='project'>
        <div className='project-header'>
          <h2>
            <span title={project.owner}>
              <Avatar size='large' src={project.ownerAvatar} />
            </span>
            &nbsp;&nbsp;&nbsp;
            <span title={`${project.projectType} ${project.name}`}>
              {iconMapper[project.projectType]}
              &nbsp;{project.name}
            </span>
          </h2>

          <div className='project-control'>
            <span style={{ cursor: 'pointer' }}>
              <h2
                onClick={e => this.onClickGroup(project.group.id)}
                title={project.group && `Group: ${project.group.name}`}
              >
                <TeamOutlined />
                {project.group && project.group.users.length}
              </h2>
            </span>

            <EditProject />

            <Popconfirm
              title='Are you sure?'
              okText='Yes'
              cancelText='No'
              onConfirm={() => console.log('aa')}
              className='group-setting'
            >
              <DeleteOutlined
                title='Delete Project'
                style={{ fontSize: 20, marginLeft: '10px', cursor: 'pointer' }}
              />
            </Popconfirm>
          </div>
        </div>
        <div>{project.description}</div>
      </div>
    );
  }
}

const mapStateToProps = (state: IState) => ({
  project: state.project.project,
  groups: state.group.groups
});

export default connect(mapStateToProps, { getProject })(ProjectPage);
