import React, {useState} from 'react';
import './admin-choice.styles.less';
import {Choice} from "../../features/templates/interface";
import {Button, Checkbox, Divider, Empty, Modal, Radio, Typography} from "antd";
import {DeleteFilled} from "@ant-design/icons";
import {connect} from "react-redux";
import {
    deleteChoice,
    deleteSelection,
    getChoice,
    updateChoice,
    updateSelection
} from "../../features/templates/actions";
import {useHistory} from "react-router-dom";

const {Title, Text} = Typography;

type ChoiceProps = {
    choice: Choice;
    deleteChoice: (id: number) => void;
    deleteSelection: (id: number) => void;
    updateChoice: (id: number, name: string, multiple: boolean, instructionIncluded: boolean) => void;
    updateSelection: (id: number, text: string) => void;
    getChoice: (choiceId: number) => void;
};

const AdminChoiceElem: React.FC<ChoiceProps> = (
    {
        choice,
        getChoice,
        deleteChoice,
        deleteSelection,
        updateChoice,
        updateSelection
    }) => {

    const history = useHistory();

    const [visible, setVisible] = useState(false);

    const openModal = () => {
        setVisible(true);
        getChoice(choice.id);
    };

    const handleCancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation();
        setVisible(false);
    };

    const nameChange = (input: any) => {
        console.log(input);
        updateChoice(choice.id, input, choice.multiple, choice.instructionIncluded);
    }

    const selectionTextChange = (e: string, id: number) => {
        console.log(e);
        updateSelection(id, e);
    }

    const deleteSelectionElem = (id: number) => {
        deleteSelection(id);
    }

    const choiceMultipleChange = (input: any) => {
        console.log(input)
        updateChoice(choice.id, choice.name, input.target.value, choice.instructionIncluded);
        setVisible(false);
    }

    const onChangeInstructionIncluded = (value: any) => {
        console.log(value.target.checked);
        updateChoice(choice.id, choice.name, choice.multiple, value.target.checked);
        setVisible(false);
    }

    const getModal = () => {
        return (
            <Modal
                width={900}
                title={<Title editable={{onChange: nameChange}}>{choice.name}</Title>}
                cancelText='Cancel'
                destroyOnClose
                visible={visible}
                onCancel={(e) => handleCancel(e)}
                footer={<span><Button type='primary' onClick={() => deleteChoice(choice.id)}>Delete this Choice</Button></span>}
            >
                <div>
                    <div>
                        <Radio.Group value={choice.multiple} onChange={choiceMultipleChange}>
                            <Radio value={true}>Multiple Selections</Radio>
                            <Radio value={false}>Single Selection</Radio>
                        </Radio.Group>
                        <Checkbox checked={choice.instructionIncluded} onChange={onChangeInstructionIncluded}>
                            Includes Instruction
                        </Checkbox>
                    </div>
                    <Divider/>
                    <div className='choices-popup'>
                        {choice.selections.map(s => <span>
                            <Text editable={{onChange: (e) => selectionTextChange(e, s.id)}}>{s.text}</Text> ({s.id})
                            <DeleteFilled style={{cursor: 'pointer'}} onClick={() => deleteSelectionElem(s.id)}/>
                        </span>)}
                    </div>
                    <Divider/>
                    <div>
                        <h3>Associated Categories</h3>
                        {choice.categories.length > 0 && choice.categories.map(category => {
                            return <span style={{cursor: 'pointer', padding: '5px', backgroundColor: `${category.color}`}}
                                         onClick={() => history.push(`/admin/categories/${category.id}`)}>
                                {category.name} ({category.id})
                            </span>
                        })}
                        {choice.categories.length === 0 && <Empty/>}
                    </div>
                    <div>
                        <h3>Associated Steps</h3>
                        {choice.steps.length > 0 && choice.steps.map(step => {
                            return <span style={{cursor: 'pointer', padding: '5px'}}
                                         onClick={() => history.push(`/admin/steps/${step.id}`)}>
                                {step.name} ({step.id})
                            </span>
                        })}
                        {choice.steps.length === 0 && <Empty/>}
                    </div>
                </div>
            </Modal>
        );
    }

    return <span className='choice-elem' onClick={openModal}>
            {choice.name} ({choice.id})
        {getModal()}
    </span>
};


export default connect(null, {
    getChoice,
    deleteChoice,
    updateChoice,
    deleteSelection,
    updateSelection
})(AdminChoiceElem);
