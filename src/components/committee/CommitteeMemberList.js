// CommitteeMemberItem.js
import { Popover, List, Tag, Button } from "antd";
import { roleColorMap, roleLabels } from "./constants";

const CommitteeMemberItem = ({ member, onDeleteExternal }) => {
    // ... existing renderCommitteeMemberItem logic
    var firstName = "";
    var firstLetter = "";

    if (member.teacher) {
        firstName = member.teacher?.firstname || "";
        firstLetter = member.teacher?.lastname || "";
    } else {
        firstName = member.firstname || "";
        firstLetter = member.lastname || "";
    }

    const popoverContent = !member.teacher ? (
        <div style={{ fontSize: 12 }}>
            <div>
                <strong>Имэйл:</strong> {member?.email || "-"}
            </div>
            <div>
                <strong>Утас:</strong> {member?.phone || "-"}
            </div>
            <div>
                <strong>Байгууллага:</strong> {member?.organization || "-"}
            </div>

            <div>
                <strong>Албан тушаал:</strong> {member?.position || "-"}
            </div>
        </div>
    ) : (
        <div style={{ fontSize: 12 }}>
            <div>
                {member.teacher?.lastname} овогтой {member.teacher?.firstname}{" "}
            </div>
            <div>
                <strong>Имэйл:</strong> {member.teacher?.email || "-"}
            </div>
        </div>
    );

    return (
        <Popover content={popoverContent} trigger="hover">
            <List.Item
                actions={[
                    <Tag color={roleColorMap[member.role]} key={member.role}>
                        {roleLabels[member.role]}
                    </Tag>,
                    !member.teacher && (
                        <Button danger onClick={() => onDeleteExternal(member)}>
                            Устгах
                        </Button>
                    ),
                ]}
            >
                <List.Item.Meta title={`${firstLetter} ${firstName}`} />
            </List.Item>
        </Popover>
    );
};

export default CommitteeMemberItem;
