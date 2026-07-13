const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("award")
        .setDescription("Recognize a staff member for outstanding performance.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)

        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Where the award will be announced.")
                .addChannelTypes(
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement
                )
                .setRequired(true)
        )

        .addUserOption(option =>
            option
                .setName("staff-member")
                .setDescription("The staff member receiving the award.")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("award")
                .setDescription("Award title.")
                .setRequired(true)
                .addChoices(
                    {
                        name: "🏆 Staff Member of the Week",
                        value: "🏆 Staff Member of the Week",
                    },
                    {
                        name: "⭐ Outstanding Performance",
                        value: "⭐ Outstanding Performance",
                    },
                    {
                        name: "🤝 Leadership Excellence",
                        value: "🤝 Leadership Excellence",
                    },
                    {
                        name: "🔥 Above & Beyond",
                        value: "🔥 Above & Beyond",
                    },
                    {
                        name: "💎 Community Impact",
                        value: "💎 Community Impact",
                    }
                )
        )

        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for receiving the award.")
                .setMaxLength(1000)
                .setRequired(true)
        )

        .addRoleOption(option =>
            option
                .setName("ping")
                .setDescription("Optional role to ping.")
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName("banner")
                .setDescription("Optional image URL.")
                .setRequired(false)
        ),

    async execute(interaction) {

        const channel =
            interaction.options.getChannel("channel");

        const member =
            interaction.options.getUser("staff-member");

        const award =
            interaction.options.getString("award");

        const reason =
            interaction.options.getString("reason");

        const pingRole =
            interaction.options.getRole("ping");

        const banner =
            interaction.options.getString("banner");

        const embed = new EmbedBuilder()

            .setColor("Gold")

            .setAuthor({
                name: interaction.guild.name,
                iconURL:
                    interaction.guild.iconURL({
                        dynamic: true,
                    }) || undefined,
            })

            .setTitle("🏆 Staff Recognition")

            .setDescription(
                `Congratulations ${member}!\n\nThank you for everything you continue to do for **Florida State Roleplay!**`
            )

            .addFields(
                {
                    name: "🏅 Award",
                    value: award,
                },
                {
                    name: "📝 Reason",
                    value: reason,
                },
                {
                    name: "👑 Presented By",
                    value: `${interaction.user}`,
                }
            )

            .setFooter({
                text: "FLSRP Management • Recognition System",
                iconURL:
                    interaction.client.user.displayAvatarURL(),
            })

            .setTimestamp();

        if (banner) {
            embed.setImage(banner);
        }

        await channel.send({

            content: pingRole
                ? `${pingRole}`
                : undefined,

            embeds: [embed],

            allowedMentions: {
                roles: pingRole
                    ? [pingRole.id]
                    : [],
            },
        });

        await interaction.reply({

            content:
                `✅ Award posted successfully in ${channel}.`,

            ephemeral: true,
        });

    },
};