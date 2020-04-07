import React, {useEffect} from 'react';
import {Form, Result} from 'antd';
import {LinkOutlined} from '@ant-design/icons';
import {connect} from 'react-redux';
import {getTaskSharables, revokeTaskSharable} from '../../features/tasks/actions';
import {getNoteSharables, revokeNoteSharable} from '../../features/notes/actions';
import {getProjectItemType, ProjectType} from "../../features/project/constants";
import {IState} from "../../store";
import {User} from "../group/interface";
import {SharableLink} from "../system/interface";

type ProjectItemProps = {
    type: ProjectType;
    projectItemId: number;
    taskSharedUsers: User[];
    taskSharedLinks: SharableLink[];
    noteSharedUsers: User[];
    noteSharedLinks: SharableLink[];
    getTaskSharables: (taskId: number) => void;
    revokeTaskSharable: (taskId: number, user?: string, link?: string) => void;
    getNoteSharables: (noteId: number) => void;
    revokeNoteSharable: (noteId: number, user?: string, link?: string) => void;
};

const ShareProjectItemManagement: React.FC<ProjectItemProps> = props => {
    const [form] = Form.useForm();

    const getSharablesCall: { [key in ProjectType]: Function } = {
        [ProjectType.NOTE]: props.getNoteSharables,
        [ProjectType.TODO]: props.getTaskSharables,
        [ProjectType.LEDGER]: () => {},
    };

    const getSharablesFunction = getSharablesCall[props.type];

    useEffect(() => {
        getSharablesFunction(props.projectItemId);
    }, []);

    return <div>
        <Form form={form}>
            <Form.Item name='manage'>
                <Result
                    icon={<LinkOutlined/>}
                    title={`Manage Shared ${getProjectItemType(props.type)}`}
                />
            </Form.Item>
        </Form>
    </div>
};

const mapStateToProps = (state: IState) => ({
    taskSharedUsers: state.task.sharedUsers,
    taskSharedLinks: state.task.sharedLinks,
    noteSharedUsers: state.note.sharedUsers,
    noteSharedLinks: state.note.sharedLinks,
});

export default connect(mapStateToProps, {
    getTaskSharables,
    revokeTaskSharable,
    getNoteSharables,
    revokeNoteSharable
})(ShareProjectItemManagement);