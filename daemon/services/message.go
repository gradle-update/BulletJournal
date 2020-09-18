package services

import (
	"fmt"
	"github.com/mailjet/mailjet-apiv3-go"
	"github.com/singerdmx/BulletJournal/daemon/clients"
	"github.com/singerdmx/BulletJournal/daemon/daos/models"
	"strconv"
)

const (
	Accept  = "accept"
	Decline = "decline"
)

func GetUrl(uuid uint64, action string) string {
	return "https://bulletjournal.us/public/notifications/" + strconv.FormatUint(uuid, 10) + "/answer?action=" + action
}

// Send join group invitation email to users
func SendJoinGroupEmail(username, email string, groupId, uid uint64) {
	var g models.Group // TODO: query group from db
	acceptUrl := GetUrl(uid, Accept)
	declineUrl := GetUrl(uid, Decline)
	messagesInfo := []mailjet.InfoMessagesV31{
		{
			From: &mailjet.RecipientV31{
				Email: "bulletjournal1024@hotmail.com",
				Name:  "Bullet Journal",
			},
			To: &mailjet.RecipientsV31{
				mailjet.RecipientV31{
					Email: email,
					Name:  username,
				},
			},
			Subject:  "You are invited to Group " + g.Name + " by " + g.Owner,
			TextPart: "Dear " + username + ",",
			HTMLPart: "Welcome to BulletJournal!\n\nClick the following link to confirm and activate your new account:\n<a href=\"" + acceptUrl + "\">Accept</a><br /><a href=\"" + declineUrl + "\">Decline</a>\n\nIf the above link is not clickable, try copying and pasting it into the address bar of your web browser.",
		},
	}

	messages := mailjet.MessagesV31{Info: messagesInfo}
	if client, err := clients.GetMailClient(); err != nil {
		log.Fatal(err)
	} else {
		if res, err := client.SendMailV31(&messages); err != nil {
			log.Fatal(err)
		} else {
			fmt.Printf("Data: %+v\n", res)
		}
	}
}
