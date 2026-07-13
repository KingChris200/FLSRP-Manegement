const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');

const prioritySettings = {
    available: {
        title: 'Priority Status: Available',
        description:
            'Priorities are currently available. Players may initiate a priority after following all server rules and requirements.',
        color: 'Green',
        emoji: '🟢',
    },

    active: {
        title: 'Priority Status: Active',
        description:
            'A priority is currently active. Do not begin another priority until the current situation has concluded.',
        color: 'Red',
        emoji: '🔴',
    },

    hold: {
        title: 'Priority Status: On Hold',
        description:
            'Priorities are temporarily on hold. Do not initiate a priority until management updates the status.',
        color: 'Yellow',
        emoji: '🟡',
    },

    cooldown: {
        title: 'Priority Status: Cooldown',
        description:
            'Priority cooldown is currently active. Please wait until the cooldown has ended before starting another priority.',
        color: 'Orange',
        emoji: '⏳',
    },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('priority')
        .setDescription('Update the ER:LC priority status.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Where the priority update should be sent.')
                .addChannelTypes(
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('status')
                .setDescription('The new priority status.')
                .setRequired(true)
                .addChoices(
                    {
                        name: '🟢 Available',
                        value: 'available',
                    },
                    {
                        name: '🔴 Active',
                        value: 'active',
                    },
                    {
                        name: '🟡 On Hold',
                        value: 'hold',
                    },
                    {
                        name: '⏳ Cooldown',
                        value: 'cooldown',
                    }
                )
        )

        .addIntegerOption(option =>
            option
                .setName('cooldown')
                .setDescription(
                    'Optional cooldown length in minutes.'
                )
                .setMinValue(1)
                .setMaxValue(180)
                .setRequired(false)
        )

        .addUserOption(option =>
            option
                .setName('priority-owner')
                .setDescription(
                    'The player currently responsible for the active priority.'
                )
                .setRequired(false)
        )

        .addRoleOption(option =>
            option
                .setName('ping')
                .setDescription('An optional role to notify.')
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('notes')
                .setDescription('Optional additional information.')
                .setMaxLength(1000)
                .setRequired(false)
        ),

    async execute(interaction) {
        const channel =
            interaction.options.getChannel('channel');

        const status =
            interaction.options.getString('status');

        const cooldown =
            interaction.options.getInteger('cooldown');

        const priorityOwner =
            interaction.options.getUser('priority-owner');

        const pingRole =
            interaction.options.getRole('ping');

        const notes =
            interaction.options.getString('notes');

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content: '❌ Please select a valid text channel.',
                ephemeral: true,
            });
        }

        const selectedStatus = prioritySettings[status];

        if (!selectedStatus) {
            return interaction.reply({
                content: '❌ That priority status is invalid.',
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
                `${selectedStatus.emoji} ${selectedStatus.title}`
            )
            .setDescription(selectedStatus.description)
            .addFields({
                name: '📡 Current Status',
                value: selectedStatus.title.replace(
                    'Priority Status: ',
                    ''
                ),
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

        if (cooldown) {
            const endTimestamp =
                Math.floor(Date.now() / 1000) +
                cooldown * 60;

            embed.addFields({
                name: '⏱️ Cooldown',
                value:
                    `${cooldown} minute${cooldown === 1 ? '' : 's'}\n` +
                    `Ends <t:${endTimestamp}:R>`,
                inline: true,
            });
        }

        if (priorityOwner) {
            embed.addFields({
                name: '👤 Priority Owner',
                value: `${priorityOwner}`,
                inline: true,
            });
        }

        if (notes) {
            embed.addFields({
                name: '📝 Additional Information',
                value: notes,
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
                    `✅ Priority status updated to **${selectedStatus.title.replace(
                        'Priority Status: ',
                        ''
                    )}** in ${channel}.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Priority command error:', error);

            const response = {
                content:
                    '❌ I could not send the priority update. Make sure I can view the channel, send messages, and embed links.',
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