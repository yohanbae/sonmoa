export interface UserGroup{
    displayName:string;
    uid:string;
    group:[
        {
        groupName:string;
        groupUid:string;
        role:string;
        private:boolean;
        }
    ]
}