const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');

const peacetimeStatuses = {
    enabled: {
        label: 'Enabled',
        emoji: '🕊️',
        color: 'Aqua',
        description:
            'Peacetime is now enabled. All players must avoid criminal activity, pursuits, shootouts, and other disruptive roleplay until further notice.',
    },

    disabled: {
        label: 'Disabled',
        emoji: '🚨',
        color: 'Red',
        description:
            'Peacetime is now disabled. Normal roleplay may resume while following all server rules and priority restrictions.',
    },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('peacetime')
        .setDescription('Enable or disable ER:LC peacetime.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Where the peacetime update should be sent.')
                .addChannelTypes(
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('status')
                .setDescription('Choose the new peacetime status.')
                .setRequired(true)
                .addChoices(
                    {
                        name: '🕊️ Enabled',
                        value: 'enabled',
                    },
                    {
                        name: '🚨 Disabled',
                        value: 'disabled',
                    }
                )
        )

        .addIntegerOption(option =>
            option
                .setName('duration')
                .setDescription(
                    'Optional peacetime duration in minutes.'
                )
                .setMinValue(1)
                .setMaxValue(180)
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Optional reason for changing peacetime.')
                .setMaxLength(1000)
                .setRequired(false)
        )

        .addRoleOption(option =>
            option
                .setName('ping')
                .setDescription('An optional role to notify.')
                .setRequired(false)
        ),

    async execute(interaction) {
        const channel =
            interaction.options.getChannel('channel');

        const status =
            interaction.options.getString('status');

        const duration =
            interaction.options.getInteger('duration');

        const reason =
            interaction.options.getString('reason');

        const pingRole =
            interaction.options.getRole('ping');

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content: '❌ Please select a valid text channel.',
                ephemeral: true,
            });
        }

        const selectedStatus = peacetimeStatuses[status];

        if (!selectedStatus) {
            return interaction.reply({
                content: '❌ That peacetime status is invalid.',
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setColor(selectedStatus.color)
            .setAuthor({
                name: interaction.guild.name,
                iconURL:
                    interaction.guild.iconURL({
                        dynamic: true,
                    }) || undefined,
            })
            .setTitle(
                `${selectedStatus.emoji} Peacetime ${selectedStatus.label}`
            )
            .setDescription(selectedStatus.description)
            .addFields({
                name: '📡 Current Status',
                value: selectedStatus.label,
                inline: true,
            })
            .setFooter({
                text: `Updated by ${interaction.user.username}`,
                iconURL:
                    interaction.user.displayAvatarURL({
                        dynamic: true,
                    }),
            })
            .setTimestamp();

        if (duration) {
            const endTimestamp =
                Math.floor(Date.now() / 1000) +
                duration * 60;

            embed.addFields({
                name: '⏱️ Duration',
                value:
                    `${duration} minute${duration === 1 ? '' : 's'}\n` +
                    `Ends <t:${endTimestamp}:R>`,
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
                    `✅ Peacetime has been **${selectedStatus.label.toLowerCase()}** in ${channel}.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Peacetime command error:', error);

            const response = {
                content:
                    '❌ I could not send the peacetime update. Check my channel permissions.',
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