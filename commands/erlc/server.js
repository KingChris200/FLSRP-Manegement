const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');

const serverStatuses = {
    open: {
        label: 'Open',
        emoji: '🟢',
        color: 'Green',
        description:
            'The Florida State Roleplay server is currently open! Players may join using the server code below.',
    },

    locked: {
        label: 'Locked',
        emoji: '🔒',
        color: 'Orange',
        description:
            'The Florida State Roleplay server is currently locked. New players may not join until further notice.',
    },

    maintenance: {
        label: 'Under Maintenance',
        emoji: '🛠️',
        color: 'Yellow',
        description:
            'The Florida State Roleplay server is temporarily unavailable while maintenance is being completed.',
    },

    restarting: {
        label: 'Restarting',
        emoji: '🔄',
        color: 'Blue',
        description:
            'The Florida State Roleplay server is restarting. Please wait for another update before rejoining.',
    },

    closed: {
        label: 'Closed',
        emoji: '🔴',
        color: 'Red',
        description:
            'The Florida State Roleplay server is currently closed. Thank you to everyone who participated!',
    },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Update the current ER:LC server status.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel where the update will be sent.')
                .addChannelTypes(
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('status')
                .setDescription('Choose the new server status.')
                .setRequired(true)
                .addChoices(
                    {
                        name: '🟢 Open',
                        value: 'open',
                    },
                    {
                        name: '🔒 Locked',
                        value: 'locked',
                    },
                    {
                        name: '🛠️ Maintenance',
                        value: 'maintenance',
                    },
                    {
                        name: '🔄 Restarting',
                        value: 'restarting',
                    },
                    {
                        name: '🔴 Closed',
                        value: 'closed',
                    }
                )
        )

        .addStringOption(option =>
            option
                .setName('server-code')
                .setDescription('Optional ER:LC private server code.')
                .setMaxLength(50)
                .setRequired(false)
        )

        .addIntegerOption(option =>
            option
                .setName('duration')
                .setDescription(
                    'Optional estimated duration in minutes.'
                )
                .setMinValue(1)
                .setMaxValue(300)
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Optional reason for this server update.')
                .setMaxLength(1000)
                .setRequired(false)
        )

        .addRoleOption(option =>
            option
                .setName('ping')
                .setDescription('Optional role to notify.')
                .setRequired(false)
        ),

    async execute(interaction) {
        const channel =
            interaction.options.getChannel('channel');

        const status =
            interaction.options.getString('status');

        const serverCode =
            interaction.options.getString('server-code');

        const duration =
            interaction.options.getInteger('duration');

        const reason =
            interaction.options.getString('reason');

        const pingRole =
            interaction.options.getRole('ping');

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content: '❌ Please choose a valid text channel.',
                ephemeral: true,
            });
        }

        const selectedStatus = serverStatuses[status];

        if (!selectedStatus) {
            return interaction.reply({
                content: '❌ That server status is invalid.',
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setColor(selectedStatus.color)
            .setAuthor({
                name: interaction.guild.name,
                iconURL:
                    interaction.guild.iconURL({ dynamic: true }) ||
                    undefined,
            })
            .setTitle(
                `${selectedStatus.emoji} Server ${selectedStatus.label}`
            )
            .setDescription(selectedStatus.description)
            .addFields(
                {
                    name: '📡 Current Status',
                    value:
                        `${selectedStatus.emoji} ` +
                        selectedStatus.label,
                    inline: true,
                },
                {
                    name: '👤 Updated By',
                    value: `${interaction.user}`,
                    inline: true,
                }
            )
            .setFooter({
                text: 'FLSRP Management',
                iconURL:
                    interaction.client.user.displayAvatarURL(),
            })
            .setTimestamp();

        if (serverCode) {
            embed.addFields({
                name: '🔑 Server Code',
                value: `\`${serverCode}\``,
                inline: true,
            });
        }

        if (duration) {
            const endTimestamp =
                Math.floor(Date.now() / 1000) +
                duration * 60;

            embed.addFields({
                name: '⏱️ Estimated Duration',
                value:
                    `${duration} minute${duration === 1 ? '' : 's'}\n` +
                    `Expected update <t:${endTimestamp}:R>`,
                inline: true,
            });
        }

        if (reason) {
            embed.addFields({
                name: '📝 Reason',
                value: reason,
                inline: false,
            });
        }

        try {
            await channel.send({
                content: pingRole ? `${pingRole}` : undefined,
                embeds: [embed],
                allowedMentions: {
                    roles: pingRole ? [pingRole.id] : [],
                },
            });

            await interaction.reply({
                content:
                    `✅ Server status changed to **${selectedStatus.label}** in ${channel}.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Server command error:', error);

            const response = {
                content:
                    '❌ I could not send the server update. Check my channel permissions.',
                ephemeral: true,
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(response);
            } else {
                await interaction.reply(response);
            }
        }
    },
};